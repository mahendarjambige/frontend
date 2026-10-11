package com.example.survey.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class UserResponseDetailDto {

    private Long responseId;
    private Long surveyId;
    private String surveyTitle;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDateTime submittedAt;
    private List<AnswerDetailDto> answers = new ArrayList<>();

    public UserResponseDetailDto() {
    }

    public Long getResponseId() {
        return responseId;
    }

    public void setResponseId(Long responseId) {
        this.responseId = responseId;
    }

    public Long getSurveyId() {
        return surveyId;
    }

    public void setSurveyId(Long surveyId) {
        this.surveyId = surveyId;
    }

    public String getSurveyTitle() {
        return surveyTitle;
    }

    public void setSurveyTitle(String surveyTitle) {
        this.surveyTitle = surveyTitle;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public List<AnswerDetailDto> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerDetailDto> answers) {
        this.answers = answers;
    }
}
