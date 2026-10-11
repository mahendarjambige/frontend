package com.example.survey.dto;

import java.util.ArrayList;
import java.util.List;

public class AnswerSubmissionDto {

    private Long questionId;
    private Long optionId; // Single choice option
    private List<Long> selectedOptionIds = new ArrayList<>(); // Checkbox multi options
    private String textAnswer; // Text response

    public AnswerSubmissionDto() {
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public List<Long> getSelectedOptionIds() {
        return selectedOptionIds;
    }

    public void setSelectedOptionIds(List<Long> selectedOptionIds) {
        this.selectedOptionIds = selectedOptionIds;
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }
}
