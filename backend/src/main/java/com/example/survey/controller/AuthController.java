package com.example.survey.controller;

import com.example.survey.dto.AuthRequest;
import com.example.survey.dto.AuthResponse;
import com.example.survey.dto.ForgotPasswordRequest;
import com.example.survey.dto.RegisterRequest;
import com.example.survey.dto.ResetPasswordRequest;
import com.example.survey.dto.UserSummaryDto;
import com.example.survey.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.register(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummaryDto> getCurrentUser() {
        UserSummaryDto profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount() {
        authService.deleteCurrentUserAccount();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Map<String, String> response = authService.requestPasswordResetCode(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Map<String, String> response = authService.resetPasswordWithCode(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok(response);
    }
}
