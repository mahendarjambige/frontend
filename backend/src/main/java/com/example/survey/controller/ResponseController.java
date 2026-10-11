package com.example.survey.controller;

import com.example.survey.dto.SurveySubmissionRequest;
import com.example.survey.dto.UserResponseDetailDto;
import com.example.survey.entity.User;
import com.example.survey.service.AuthService;
import com.example.survey.service.ResponseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ResponseController {

    private final ResponseService responseService;
    private final AuthService authService;

    public ResponseController(ResponseService responseService, AuthService authService) {
        this.responseService = responseService;
        this.authService = authService;
    }

    // Participant: Submit survey response
    @PostMapping("/surveys/{id}/submit")
    public ResponseEntity<UserResponseDetailDto> submitSurveyResponse(@PathVariable Long id,
                                                                      @Valid @RequestBody SurveySubmissionRequest request) {
        request.setSurveyId(id);
        User currentUser = authService.getCurrentAuthenticatedUser();
        UserResponseDetailDto response = responseService.submitResponse(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Participant: Get personal participation history (surveys taken + polls voted)
    @GetMapping("/participant/history")
    public ResponseEntity<Map<String, Object>> getMyHistory() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Map<String, Object> history = responseService.getUserParticipationHistory(currentUser);
        return ResponseEntity.ok(history);
    }

    // Admin: View all submitted responses for a survey
    @GetMapping("/admin/surveys/{surveyId}/responses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDetailDto>> getSurveyResponses(@PathVariable Long surveyId) {
        return ResponseEntity.ok(responseService.getResponsesForSurvey(surveyId));
    }

    // Admin: View details of a specific response
    @GetMapping("/admin/responses/{responseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDetailDto> getResponseDetails(@PathVariable Long responseId) {
        return ResponseEntity.ok(responseService.getResponseDetails(responseId));
    }
}
