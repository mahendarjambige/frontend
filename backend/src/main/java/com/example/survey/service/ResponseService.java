package com.example.survey.service;

import com.example.survey.dto.*;
import com.example.survey.entity.*;
import com.example.survey.exception.BadRequestException;
import com.example.survey.exception.ResourceNotFoundException;
import com.example.survey.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResponseService {

    private final ResponseRepository responseRepository;
    private final AnswerRepository answerRepository;
    private final SurveyRepository surveyRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final PollVoteRepository pollVoteRepository;

    public ResponseService(ResponseRepository responseRepository,
                           AnswerRepository answerRepository,
                           SurveyRepository surveyRepository,
                           QuestionRepository questionRepository,
                           OptionRepository optionRepository,
                           PollVoteRepository pollVoteRepository) {
        this.responseRepository = responseRepository;
        this.answerRepository = answerRepository;
        this.surveyRepository = surveyRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.pollVoteRepository = pollVoteRepository;
    }

    @Transactional
    public UserResponseDetailDto submitResponse(SurveySubmissionRequest request, User user) {
        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id: " + request.getSurveyId()));

        if (survey.getStatus() != SurveyStatus.PUBLISHED) {
            throw new BadRequestException("Survey is not currently active for responses. Status: " + survey.getStatus());
        }

        if (responseRepository.existsByUserIdAndSurveyId(user.getId(), survey.getId())) {
            throw new BadRequestException("You have already submitted a response for this survey");
        }

        Response response = new Response();
        response.setUser(user);
        response.setSurvey(survey);
        Response savedResponse = responseRepository.save(response);

        for (AnswerSubmissionDto ansDto : request.getAnswers()) {
            Question question = questionRepository.findById(ansDto.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + ansDto.getQuestionId()));

            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                if (ansDto.getOptionId() != null) {
                    Option option = optionRepository.findById(ansDto.getOptionId())
                            .orElseThrow(() -> new ResourceNotFoundException("Option not found with id: " + ansDto.getOptionId()));
                    Answer answer = new Answer(null, savedResponse, question, option, null);
                    savedResponse.addAnswer(answer);
                }
            } else if (question.getQuestionType() == QuestionType.CHECKBOX) {
                if (ansDto.getSelectedOptionIds() != null) {
                    for (Long optId : ansDto.getSelectedOptionIds()) {
                        Option option = optionRepository.findById(optId)
                                .orElseThrow(() -> new ResourceNotFoundException("Option not found with id: " + optId));
                        Answer answer = new Answer(null, savedResponse, question, option, null);
                        savedResponse.addAnswer(answer);
                    }
                }
            } else if (question.getQuestionType() == QuestionType.TEXT) {
                if (ansDto.getTextAnswer() != null && !ansDto.getTextAnswer().trim().isEmpty()) {
                    Answer answer = new Answer(null, savedResponse, question, null, ansDto.getTextAnswer().trim());
                    savedResponse.addAnswer(answer);
                }
            }
        }

        Response finalSaved = responseRepository.save(savedResponse);
        return mapToDetailDto(finalSaved);
    }

    public List<UserResponseDetailDto> getResponsesForSurvey(Long surveyId) {
        if (!surveyRepository.existsById(surveyId)) {
            throw new ResourceNotFoundException("Survey not found with id: " + surveyId);
        }
        return responseRepository.findBySurveyId(surveyId).stream()
                .map(this::mapToDetailDto)
                .collect(Collectors.toList());
    }

    public UserResponseDetailDto getResponseDetails(Long responseId) {
        Response response = responseRepository.findById(responseId)
                .orElseThrow(() -> new ResourceNotFoundException("Response not found with id: " + responseId));
        return mapToDetailDto(response);
    }

    public Map<String, Object> getUserParticipationHistory(User user) {
        List<Response> userResponses = responseRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
        List<PollVote> userVotes = pollVoteRepository.findByUserIdOrderByVotedAtDesc(user.getId());

        List<Map<String, Object>> surveyHistory = userResponses.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("responseId", r.getId());
            map.put("surveyId", r.getSurvey().getId());
            map.put("surveyTitle", r.getSurvey().getTitle());
            map.put("submittedAt", r.getSubmittedAt());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> pollHistory = userVotes.stream().map(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("voteId", v.getId());
            map.put("pollId", v.getPoll().getId());
            map.put("pollTitle", v.getPoll().getTitle());
            map.put("votedOptionId", v.getOption().getId());
            map.put("votedOptionText", v.getOption().getOptionText());
            map.put("votedAt", v.getVotedAt());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("surveys", surveyHistory);
        result.put("polls", pollHistory);
        result.put("totalSurveysParticipated", surveyHistory.size());
        result.put("totalPollsVoted", pollHistory.size());

        return result;
    }

    private UserResponseDetailDto mapToDetailDto(Response r) {
        UserResponseDetailDto dto = new UserResponseDetailDto();
        dto.setResponseId(r.getId());
        dto.setSurveyId(r.getSurvey().getId());
        dto.setSurveyTitle(r.getSurvey().getTitle());
        dto.setUserId(r.getUser().getId());
        dto.setUserName(r.getUser().getName());
        dto.setUserEmail(r.getUser().getEmail());
        dto.setSubmittedAt(r.getSubmittedAt());

        List<AnswerDetailDto> answerDtos = r.getAnswers().stream().map(a -> {
            AnswerDetailDto ad = new AnswerDetailDto();
            ad.setQuestionId(a.getQuestion().getId());
            ad.setQuestionText(a.getQuestion().getQuestionText());
            ad.setQuestionType(a.getQuestion().getQuestionType());
            if (a.getOption() != null) {
                ad.setOptionId(a.getOption().getId());
                ad.setOptionText(a.getOption().getOptionText());
            }
            ad.setTextAnswer(a.getTextAnswer());
            return ad;
        }).collect(Collectors.toList());

        dto.setAnswers(answerDtos);
        return dto;
    }
}
