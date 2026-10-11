package com.example.survey.controller;

import com.example.survey.dto.PollResultDto;
import com.example.survey.dto.SurveyResultDto;
import com.example.survey.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    // View survey results (Admin or Participant with permission)
    @GetMapping("/surveys/{surveyId}/results")
    public ResponseEntity<SurveyResultDto> getSurveyResults(@PathVariable Long surveyId) {
        return ResponseEntity.ok(resultService.getSurveyResults(surveyId));
    }

    // View poll results
    @GetMapping("/polls/{pollId}/results")
    public ResponseEntity<PollResultDto> getPollResults(@PathVariable Long pollId) {
        return ResponseEntity.ok(resultService.getPollResults(pollId));
    }

    // Admin dashboard system statistics
    @GetMapping("/admin/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(resultService.getSystemOverviewStats());
    }
}
