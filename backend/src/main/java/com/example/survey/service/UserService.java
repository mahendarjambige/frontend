package com.example.survey.service;

import com.example.survey.dto.UserSummaryDto;
import com.example.survey.entity.Role;
import com.example.survey.entity.User;
import com.example.survey.exception.BadRequestException;
import com.example.survey.exception.ResourceNotFoundException;
import com.example.survey.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Value("${app.admin.email:mahendarjambige@gmail.com}")
    private String adminEmail;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public UserSummaryDto getUserById(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return new UserSummaryDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt());
    }

    @Transactional
    public UserSummaryDto updateUserRole(Long id, Role role) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Strict Single-Admin Security Rule:
        // Prevent promoting any account to ROLE_ADMIN
        if (role == Role.ROLE_ADMIN && !u.getEmail().equalsIgnoreCase(adminEmail.trim().toLowerCase())) {
            throw new BadRequestException("Role elevation rejected: Only " + adminEmail + " is permitted to hold the ADMIN role.");
        }

        // Prevent altering the designated admin's role
        if (u.getEmail().equalsIgnoreCase(adminEmail.trim().toLowerCase())) {
            throw new BadRequestException("The primary administrator role cannot be altered.");
        }

        u.setRole(role);
        User saved = userRepository.save(u);
        return new UserSummaryDto(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.getCreatedAt());
    }

    @Transactional
    public void deleteUser(Long id, Long currentUserId) {
        if (id.equals(currentUserId)) {
            throw new BadRequestException("You cannot delete your own admin account.");
        }

        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (u.getEmail().equalsIgnoreCase(adminEmail.trim().toLowerCase())) {
            throw new BadRequestException("The primary administrator account cannot be deleted.");
        }

        userRepository.delete(u);
    }
}
