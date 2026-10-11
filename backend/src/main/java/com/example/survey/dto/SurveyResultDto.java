package com.example.survey.dto;

import java.util.ArrayList;
import java.util.List;

public class SurveyResultDto {

    private Long surveyId;
    private String surveyTitle;
    private String surveyDescription;
    private long totalResponses;
    private List<QuestionResultDto> questions = new ArrayList<>();

    public SurveyResultDto() {
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

    public String getSurveyDescription() {
        return surveyDescription;
    }

    public void setSurveyDescription(String surveyDescription) {
        this.surveyDescription = surveyDescription;
    }

    public long getTotalResponses() {
        return totalResponses;
    }

    public void setTotalResponses(long totalResponses) {
        this.totalResponses = totalResponses;
    }

    public List<QuestionResultDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResultDto> questions) {
        this.questions = questions;
    }
}
