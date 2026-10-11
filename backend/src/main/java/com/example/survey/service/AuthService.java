package com.example.survey.service;

import com.example.survey.dto.AuthRequest;
import com.example.survey.dto.AuthResponse;
import com.example.survey.dto.RegisterRequest;
import com.example.survey.dto.UserSummaryDto;
import com.example.survey.entity.Role;
import com.example.survey.entity.User;
import com.example.survey.exception.BadRequestException;
import com.example.survey.exception.ResourceNotFoundException;
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

@Service
public class AuthService {

    @Value("${app.admin.email:mahendarjambige@gmail.com}")
    private String adminEmail;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
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
}
