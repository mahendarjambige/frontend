package com.example.survey.service;

import com.example.survey.dto.*;
import com.example.survey.entity.*;
import com.example.survey.exception.ResourceNotFoundException;
import com.example.survey.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResultService {

    private final SurveyRepository surveyRepository;
    private final ResponseRepository responseRepository;
    private final AnswerRepository answerRepository;
    private final PollRepository pollRepository;
    private final PollVoteRepository pollVoteRepository;
    private final UserRepository userRepository;

    public ResultService(SurveyRepository surveyRepository,
                         ResponseRepository responseRepository,
                         AnswerRepository answerRepository,
                         PollRepository pollRepository,
                         PollVoteRepository pollVoteRepository,
                         UserRepository userRepository) {
        this.surveyRepository = surveyRepository;
        this.responseRepository = responseRepository;
        this.answerRepository = answerRepository;
        this.pollRepository = pollRepository;
        this.pollVoteRepository = pollVoteRepository;
        this.userRepository = userRepository;
    }

    public SurveyResultDto getSurveyResults(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id: " + surveyId));

        long totalResponses = responseRepository.countBySurveyId(surveyId);

        SurveyResultDto resultDto = new SurveyResultDto();
        resultDto.setSurveyId(survey.getId());
        resultDto.setSurveyTitle(survey.getTitle());
        resultDto.setSurveyDescription(survey.getDescription());
        resultDto.setTotalResponses(totalResponses);

        List<QuestionResultDto> questionResults = new ArrayList<>();

        for (Question question : survey.getQuestions()) {
            QuestionResultDto qResult = new QuestionResultDto();
            qResult.setQuestionId(question.getId());
            qResult.setQuestionText(question.getQuestionText());
            qResult.setQuestionType(question.getQuestionType());

            List<Answer> answersForQuestion = answerRepository.findByQuestionId(question.getId());
            qResult.setTotalResponses(answersForQuestion.size());

            if (question.getQuestionType() == QuestionType.TEXT) {
                List<String> textAnswers = answersForQuestion.stream()
                        .map(Answer::getTextAnswer)
                        .filter(t -> t != null && !t.trim().isEmpty())
                        .collect(Collectors.toList());
                qResult.setTextAnswers(textAnswers);
            } else {
                List<OptionResultDto> optionResults = new ArrayList<>();
                long totalOptionSelections = answersForQuestion.size();

                for (Option option : question.getOptions()) {
                    long optionCount = answersForQuestion.stream()
                            .filter(a -> a.getOption() != null && a.getOption().getId().equals(option.getId()))
                            .count();

                    double percentage = totalOptionSelections > 0
                            ? ((double) optionCount / totalOptionSelections) * 100.0
                            : 0.0;

                    optionResults.add(new OptionResultDto(
                            option.getId(),
                            option.getOptionText(),
                            optionCount,
                            Math.round(percentage * 10.0) / 10.0
                    ));
                }
                qResult.setOptionResults(optionResults);
            }

            questionResults.add(qResult);
        }

        resultDto.setQuestions(questionResults);
        return resultDto;
    }

    public PollResultDto getPollResults(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        long totalVotes = pollVoteRepository.countByPollId(pollId);

        PollResultDto resultDto = new PollResultDto();
        resultDto.setPollId(poll.getId());
        resultDto.setPollTitle(poll.getTitle());
        resultDto.setPollDescription(poll.getDescription());
        resultDto.setTotalVotes(totalVotes);

        List<PollOptionDto> optionDtos = poll.getOptions().stream().map(opt -> {
            long count = pollVoteRepository.countByOptionId(opt.getId());
            double percentage = totalVotes > 0 ? ((double) count / totalVotes) * 100.0 : 0.0;
            return new PollOptionDto(opt.getId(), opt.getOptionText(), count, Math.round(percentage * 10.0) / 10.0);
        }).collect(Collectors.toList());

        resultDto.setOptions(optionDtos);
        return resultDto;
    }

    public Map<String, Object> getSystemOverviewStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalSurveys = surveyRepository.count();
        long activeSurveys = surveyRepository.countByStatus(SurveyStatus.PUBLISHED);
        long draftSurveys = surveyRepository.countByStatus(SurveyStatus.DRAFT);
        long closedSurveys = surveyRepository.countByStatus(SurveyStatus.CLOSED);

        long totalPolls = pollRepository.count();
        long activePolls = pollRepository.countByStatus(SurveyStatus.PUBLISHED);
        long closedPolls = pollRepository.countByStatus(SurveyStatus.CLOSED);

        long totalResponses = responseRepository.count();
        long totalVotes = pollVoteRepository.count();

        long totalUsers = userRepository.count();
        long totalParticipants = userRepository.countByRole(Role.ROLE_PARTICIPANT);
        long totalAdmins = userRepository.countByRole(Role.ROLE_ADMIN);

        stats.put("totalSurveys", totalSurveys);
        stats.put("activeSurveys", activeSurveys);
        stats.put("draftSurveys", draftSurveys);
        stats.put("closedSurveys", closedSurveys);

        stats.put("totalPolls", totalPolls);
        stats.put("activePolls", activePolls);
        stats.put("closedPolls", closedPolls);

        stats.put("totalResponses", totalResponses);
        stats.put("totalVotes", totalVotes);

        stats.put("totalUsers", totalUsers);
        stats.put("totalParticipants", totalParticipants);
        stats.put("totalAdmins", totalAdmins);

        return stats;
    }
}
