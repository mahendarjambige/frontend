package com.example.survey.dto;

import com.example.survey.entity.QuestionType;
import java.util.ArrayList;
import java.util.List;

public class QuestionResultDto {

    private Long questionId;
    private String questionText;
    private QuestionType questionType;
    private long totalResponses;
    private List<OptionResultDto> optionResults = new ArrayList<>();
    private List<String> textAnswers = new ArrayList<>();

    public QuestionResultDto() {
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

    public long getTotalResponses() {
        return totalResponses;
    }

    public void setTotalResponses(long totalResponses) {
        this.totalResponses = totalResponses;
    }

    public List<OptionResultDto> getOptionResults() {
        return optionResults;
    }

    public void setOptionResults(List<OptionResultDto> optionResults) {
        this.optionResults = optionResults;
    }

    public List<String> getTextAnswers() {
        return textAnswers;
    }

    public void setTextAnswers(List<String> textAnswers) {
        this.textAnswers = textAnswers;
    }
}
