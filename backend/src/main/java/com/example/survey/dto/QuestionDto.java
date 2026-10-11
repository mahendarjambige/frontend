package com.example.survey.dto;

import com.example.survey.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class QuestionDto {

    private Long id;

    @NotBlank(message = "Question text cannot be blank")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType questionType;

    private List<OptionDto> options = new ArrayList<>();

    public QuestionDto() {
    }

    public QuestionDto(Long id, String questionText, QuestionType questionType, List<OptionDto> options) {
        this.id = id;
        this.questionText = questionText;
        this.questionType = questionType;
        this.options = options != null ? options : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<OptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDto> options) {
        this.options = options;
    }
}
