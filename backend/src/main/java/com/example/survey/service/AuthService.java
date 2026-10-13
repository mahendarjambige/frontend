package com.example.survey.service;

import com.example.survey.dto.AuthRequest;
import com.example.survey.dto.AuthResponse;
import com.example.survey.dto.RegisterRequest;
import com.example.survey.dto.UserSummaryDto;
import com.example.survey.entity.PasswordResetToken;
import com.example.survey.entity.PollVote;
import com.example.survey.entity.Response;
import com.example.survey.entity.Role;
import com.example.survey.entity.User;
import com.example.survey.exception.BadRequestException;
import com.example.survey.exception.ResourceNotFoundException;
import com.example.survey.repository.PasswordResetTokenRepository;
import com.example.survey.repository.PollVoteRepository;
import com.example.survey.repository.ResponseRepository;
import com.example.survey.repository.UserRepository;
import com.example.survey.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class AuthService {

    @Value("${app.admin.email:mahendarjambige@gmail.com}")
    private String adminEmail;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ResponseRepository responseRepository;
    private final PollVoteRepository pollVoteRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       ResponseRepository responseRepository,
                       PollVoteRepository pollVoteRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.responseRepository = responseRepository;
        this.pollVoteRepository = pollVoteRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("Email already registered: " + cleanEmail);
        }

        // Security check: Prevent public self-registration of the primary admin email
        if (cleanEmail.equalsIgnoreCase(adminEmail.trim().toLowerCase())) {
            throw new BadRequestException("The primary administrator account is reserved and cannot be registered through public registration.");
        }

        // Security rule: ALL publicly registered users are ALWAYS assigned ROLE_PARTICIPANT.
        // Any role field sent by the client is strictly ignored.
        Role userRole = Role.ROLE_PARTICIPANT;

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateTokenForUsername(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name());
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new BadRequestException("No authenticated user found in session");
        }
        return userRepository.findByEmail(authentication.getName().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public UserSummaryDto getCurrentUserProfile() {
        User user = getCurrentAuthenticatedUser();
        return new UserSummaryDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }

    @Transactional
    public void deleteCurrentUserAccount() {
        User currentUser = getCurrentAuthenticatedUser();
        String designatedAdminEmail = adminEmail.trim().toLowerCase();

        // Security rule: Prevent deletion of the single designated administrator
        if (currentUser.getEmail().equalsIgnoreCase(designatedAdminEmail)) {
            throw new BadRequestException("The primary administrator account cannot be deleted.");
        }

        // 1. Delete all survey responses submitted by this user (cascades to answers)
        List<Response> userResponses = responseRepository.findByUserIdOrderBySubmittedAtDesc(currentUser.getId());
        if (!userResponses.isEmpty()) {
            responseRepository.deleteAll(userResponses);
        }

        // 2. Delete all poll votes submitted by this user
        List<PollVote> userVotes = pollVoteRepository.findByUserIdOrderByVotedAtDesc(currentUser.getId());
        if (!userVotes.isEmpty()) {
            pollVoteRepository.deleteAll(userVotes);
        }

        // 3. Delete user entity
        userRepository.delete(currentUser);
    }

    @Transactional
    public Map<String, String> requestPasswordResetCode(String email) {
        String cleanEmail = email.trim().toLowerCase();

        // 1. Verify user exists
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + cleanEmail));

        // 2. Protect Admin password from participant reset flow
        if (cleanEmail.equalsIgnoreCase(adminEmail.trim().toLowerCase())) {
            throw new BadRequestException("The primary administrator account password cannot be reset via participant self-service.");
        }

        // 3. Clear any existing reset tokens for this email
        passwordResetTokenRepository.deleteByEmail(cleanEmail);

        // 4. Generate unique 6-digit verification code
        String uniqueCode = String.format("%06d", new Random().nextInt(1000000));

        // 5. Save verification code valid for 15 minutes
        PasswordResetToken resetToken = new PasswordResetToken(cleanEmail, uniqueCode, 15);
        passwordResetTokenRepository.save(resetToken);

        // 6. Log generated code clearly to console for local simulation / testing
        System.out.println("=================================================================");
        System.out.println("[PASSWORD RESET] Unique Code for " + cleanEmail + ": " + uniqueCode);
        System.out.println("=================================================================");

        return Map.of(
                "message", "A unique 6-digit verification code has been sent to your email (" + cleanEmail + ").",
                "email", cleanEmail,
                "code", uniqueCode
        );
    }

    @Transactional
    public Map<String, String> resetPasswordWithCode(String email, String code, String newPassword) {
        String cleanEmail = email.trim().toLowerCase();
        String cleanCode = code.trim();

        // 1. Verify token exists
        PasswordResetToken resetToken = passwordResetTokenRepository.findByEmailAndToken(cleanEmail, cleanCode)
                .orElseThrow(() -> new BadRequestException("Invalid or incorrect verification code. Please check and try again."));

        // 2. Check token expiration
        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        // 3. Validate new password length
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long.");
        }

        // 4. Update user password
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        // 5. Invalidate token
        passwordResetTokenRepository.delete(resetToken);

        return Map.of(
                "message", "Password has been successfully updated. You can now sign in with your new password.",
                "email", cleanEmail
        );
    }
}
