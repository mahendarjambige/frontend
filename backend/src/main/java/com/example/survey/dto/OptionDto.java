package com.example.survey.dto;

import jakarta.validation.constraints.NotBlank;

public class OptionDto {

    private Long id;

    @NotBlank(message = "Option text cannot be blank")
    private String optionText;

    public OptionDto() {
    }

    public OptionDto(Long id, String optionText) {
        this.id = id;
        this.optionText = optionText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }
}
