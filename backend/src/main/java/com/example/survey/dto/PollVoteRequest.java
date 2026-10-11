package com.example.survey.dto;

import jakarta.validation.constraints.NotNull;

public class PollVoteRequest {

    @NotNull(message = "Option ID is required")
    private Long optionId;

    public PollVoteRequest() {
    }

    public PollVoteRequest(Long optionId) {
        this.optionId = optionId;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }
}
