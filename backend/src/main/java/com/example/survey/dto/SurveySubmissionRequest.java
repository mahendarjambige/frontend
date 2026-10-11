package com.example.survey.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class SurveySubmissionRequest {

    @NotNull(message = "Survey ID is required")
    private Long surveyId;

    @NotEmpty(message = "Answers cannot be empty")
    private List<AnswerSubmissionDto> answers = new ArrayList<>();

    public SurveySubmissionRequest() {
    }

    public Long getSurveyId() {
        return surveyId;
    }

    public void setSurveyId(Long surveyId) {
        this.surveyId = surveyId;
    }

    public List<AnswerSubmissionDto> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerSubmissionDto> answers) {
        this.answers = answers;
    }
}
