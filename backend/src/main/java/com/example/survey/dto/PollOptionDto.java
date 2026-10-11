package com.example.survey.dto;

import jakarta.validation.constraints.NotBlank;

public class PollOptionDto {

    private Long id;

    @NotBlank(message = "Option text cannot be blank")
    private String optionText;

    private Long voteCount = 0L;
    private Double percentage = 0.0;

    public PollOptionDto() {
    }

    public PollOptionDto(Long id, String optionText) {
        this.id = id;
        this.optionText = optionText;
    }

    public PollOptionDto(Long id, String optionText, Long voteCount, Double percentage) {
        this.id = id;
        this.optionText = optionText;
        this.voteCount = voteCount;
        this.percentage = percentage;
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

    public Long getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Long voteCount) {
        this.voteCount = voteCount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
