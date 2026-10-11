package com.example.survey.dto;

import com.example.survey.entity.QuestionType;

public class AnswerDetailDto {

    private Long questionId;
    private String questionText;
    private QuestionType questionType;
    private Long optionId;
    private String optionText;
    private String textAnswer;

    public AnswerDetailDto() {
    }

    public AnswerDetailDto(Long questionId, String questionText, QuestionType questionType, Long optionId, String optionText, String textAnswer) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.questionType = questionType;
        this.optionId = optionId;
        this.optionText = optionText;
        this.textAnswer = textAnswer;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }
}
