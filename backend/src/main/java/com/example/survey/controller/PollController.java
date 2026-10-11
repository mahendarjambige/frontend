package com.example.survey.controller;

import com.example.survey.dto.PollDto;
import com.example.survey.dto.PollVoteRequest;
import com.example.survey.entity.SurveyStatus;
import com.example.survey.entity.User;
import com.example.survey.service.AuthService;
import com.example.survey.service.PollService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PollController {

    private final PollService pollService;
    private final AuthService authService;

    public PollController(PollService pollService, AuthService authService) {
        this.pollService = pollService;
        this.authService = authService;
    }

    // Public / Participant: Get active polls
    @GetMapping("/polls/active")
    public ResponseEntity<List<PollDto>> getActivePolls() {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentAuthenticatedUser();
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(pollService.getActivePolls(currentUser));
    }

    // Participant / Admin: Get poll by ID
    @GetMapping("/polls/{id}")
    public ResponseEntity<PollDto> getPollById(@PathVariable Long id) {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentAuthenticatedUser();
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(pollService.getPollById(id, currentUser));
    }

    // Participant: Submit vote in a poll
    @PostMapping("/polls/{id}/vote")
    public ResponseEntity<PollDto> voteInPoll(@PathVariable Long id, @Valid @RequestBody PollVoteRequest voteRequest) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        PollDto updatedPoll = pollService.vote(id, voteRequest.getOptionId(), currentUser);
        return ResponseEntity.ok(updatedPoll);
    }

    // Admin: Get all polls
    @GetMapping("/admin/polls")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PollDto>> getAllPolls() {
        return ResponseEntity.ok(pollService.getAllPolls());
    }

    // Admin: Create new poll
    @PostMapping("/admin/polls")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PollDto> createPoll(@Valid @RequestBody PollDto dto) {
        User creator = authService.getCurrentAuthenticatedUser();
        PollDto created = pollService.createPoll(dto, creator);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Admin: Update poll
    @PutMapping("/admin/polls/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PollDto> updatePoll(@PathVariable Long id, @Valid @RequestBody PollDto dto) {
        PollDto updated = pollService.updatePoll(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Admin: Update poll status (PUBLISH / CLOSE)
    @PatchMapping("/admin/polls/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PollDto> updatePollStatus(@PathVariable Long id, @RequestBody Map<String, String> statusBody) {
        String statusStr = statusBody.get("status");
        SurveyStatus status = SurveyStatus.valueOf(statusStr.toUpperCase());
        PollDto updated = pollService.updatePollStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // Admin: Delete poll
    @DeleteMapping("/admin/polls/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePoll(@PathVariable Long id) {
        pollService.deletePoll(id);
        return ResponseEntity.noContent().build();
    }
}
