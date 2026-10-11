package com.example.survey.controller;

import com.example.survey.dto.QuestionDto;
import com.example.survey.service.SurveyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class QuestionController {

    private final SurveyService surveyService;

    public QuestionController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    @PostMapping("/surveys/{surveyId}/questions")
    public ResponseEntity<QuestionDto> addQuestion(@PathVariable Long surveyId, @Valid @RequestBody QuestionDto dto) {
        QuestionDto created = surveyService.addQuestionToSurvey(surveyId, dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuestionDto> updateQuestion(@PathVariable Long questionId, @Valid @RequestBody QuestionDto dto) {
        QuestionDto updated = surveyService.updateQuestion(questionId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        surveyService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
