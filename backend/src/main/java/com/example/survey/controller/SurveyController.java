package com.example.survey.controller;

import com.example.survey.dto.SurveyDto;
import com.example.survey.entity.SurveyStatus;
import com.example.survey.entity.User;
import com.example.survey.service.AuthService;
import com.example.survey.service.SurveyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SurveyController {

    private final SurveyService surveyService;
    private final AuthService authService;

    public SurveyController(SurveyService surveyService, AuthService authService) {
        this.surveyService = surveyService;
        this.authService = authService;
    }

    // Public / Participant: Get active surveys
    @GetMapping("/surveys/active")
    public ResponseEntity<List<SurveyDto>> getActiveSurveys() {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentAuthenticatedUser();
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(surveyService.getActiveSurveys(currentUser));
    }

    // Participant / Admin: Get survey by ID
    @GetMapping("/surveys/{id}")
    public ResponseEntity<SurveyDto> getSurveyById(@PathVariable Long id) {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentAuthenticatedUser();
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(surveyService.getSurveyById(id, currentUser));
    }

    // Admin: Get all surveys
    @GetMapping("/admin/surveys")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SurveyDto>> getAllSurveys() {
        return ResponseEntity.ok(surveyService.getAllSurveys());
    }

    // Admin: Create survey
    @PostMapping("/admin/surveys")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> createSurvey(@Valid @RequestBody SurveyDto dto) {
        User creator = authService.getCurrentAuthenticatedUser();
        SurveyDto created = surveyService.createSurvey(dto, creator);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Admin: Update survey
    @PutMapping("/admin/surveys/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> updateSurvey(@PathVariable Long id, @Valid @RequestBody SurveyDto dto) {
        SurveyDto updated = surveyService.updateSurvey(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Admin: Change survey status (PUBLISH / CLOSE)
    @PatchMapping("/admin/surveys/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SurveyDto> updateSurveyStatus(@PathVariable Long id, @RequestBody Map<String, String> statusBody) {
        String statusStr = statusBody.get("status");
        SurveyStatus status = SurveyStatus.valueOf(statusStr.toUpperCase());
        SurveyDto updated = surveyService.updateSurveyStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // Admin: Delete survey
    @DeleteMapping("/admin/surveys/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSurvey(@PathVariable Long id) {
        surveyService.deleteSurvey(id);
        return ResponseEntity.noContent().build();
    }
}
