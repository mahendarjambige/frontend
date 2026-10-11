package com.example.survey.service;

import com.example.survey.dto.OptionDto;
import com.example.survey.dto.QuestionDto;
import com.example.survey.dto.SurveyDto;
import com.example.survey.entity.*;
import com.example.survey.exception.ResourceNotFoundException;
import com.example.survey.repository.OptionRepository;
import com.example.survey.repository.QuestionRepository;
import com.example.survey.repository.ResponseRepository;
import com.example.survey.repository.SurveyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final ResponseRepository responseRepository;

    public SurveyService(SurveyRepository surveyRepository,
                         QuestionRepository questionRepository,
                         OptionRepository optionRepository,
                         ResponseRepository responseRepository) {
        this.surveyRepository = surveyRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.responseRepository = responseRepository;
    }

    public List<SurveyDto> getAllSurveys() {
        return surveyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SurveyDto> getActiveSurveys(User currentUser) {
        return surveyRepository.findByStatus(SurveyStatus.PUBLISHED).stream()
                .map(s -> mapToDtoWithParticipation(s, currentUser))
                .collect(Collectors.toList());
    }

    public SurveyDto getSurveyById(Long id, User currentUser) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id: " + id));
        return mapToDtoWithParticipation(survey, currentUser);
    }

    @Transactional
    public SurveyDto createSurvey(SurveyDto dto, User creator) {
        Survey survey = new Survey();
        survey.setTitle(dto.getTitle());
        survey.setDescription(dto.getDescription());
        survey.setStartDate(dto.getStartDate());
        survey.setEndDate(dto.getEndDate());
        survey.setStatus(dto.getStatus() != null ? dto.getStatus() : SurveyStatus.DRAFT);
        survey.setCreatedBy(creator);

        if (dto.getQuestions() != null) {
            for (QuestionDto qDto : dto.getQuestions()) {
                Question question = new Question();
                question.setQuestionText(qDto.getQuestionText());
                question.setQuestionType(qDto.getQuestionType());

                if (qDto.getOptions() != null) {
                    for (OptionDto optDto : qDto.getOptions()) {
                        Option option = new Option();
                        option.setOptionText(optDto.getOptionText());
                        question.addOption(option);
                    }
                }
                survey.addQuestion(question);
            }
        }

        Survey saved = surveyRepository.save(survey);
        return mapToDto(saved);
    }

    @Transactional
    public SurveyDto updateSurvey(Long id, SurveyDto dto) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id: " + id));

        survey.setTitle(dto.getTitle());
        survey.setDescription(dto.getDescription());
        survey.setStartDate(dto.getStartDate());
        survey.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) {
            survey.setStatus(dto.getStatus());
        }

        Survey saved = surveyRepository.save(survey);
        return mapToDto(saved);
    }

    @Transactional
    public SurveyDto updateSurveyStatus(Long id, SurveyStatus status) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id: " + id));
        survey.setStatus(status);
        Survey saved = surveyRepository.save(survey);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteSurvey(Long id) {
        if (!surveyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Survey not found with id: " + id);
        }
        surveyRepository.deleteById(id);
    }

    @Transactional
    public QuestionDto addQuestionToSurvey(Long surveyId, QuestionDto qDto) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id: " + surveyId));

        Question question = new Question();
        question.setQuestionText(qDto.getQuestionText());
        question.setQuestionType(qDto.getQuestionType());
        question.setSurvey(survey);

        if (qDto.getOptions() != null) {
            for (OptionDto optDto : qDto.getOptions()) {
                Option option = new Option();
                option.setOptionText(optDto.getOptionText());
                question.addOption(option);
            }
        }

        Question saved = questionRepository.save(question);
        return mapQuestionToDto(saved);
    }

    @Transactional
    public QuestionDto updateQuestion(Long questionId, QuestionDto qDto) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        question.setQuestionText(qDto.getQuestionText());
        question.setQuestionType(qDto.getQuestionType());

        // Update options
        question.getOptions().clear();
        if (qDto.getOptions() != null) {
            for (OptionDto optDto : qDto.getOptions()) {
                Option option = new Option();
                option.setOptionText(optDto.getOptionText());
                question.addOption(option);
            }
        }

        Question saved = questionRepository.save(question);
        return mapQuestionToDto(saved);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new ResourceNotFoundException("Question not found with id: " + questionId);
        }
        questionRepository.deleteById(questionId);
    }

    public SurveyDto mapToDto(Survey survey) {
        return mapToDtoWithParticipation(survey, null);
    }

    public SurveyDto mapToDtoWithParticipation(Survey survey, User user) {
        SurveyDto dto = new SurveyDto();
        dto.setId(survey.getId());
        dto.setTitle(survey.getTitle());
        dto.setDescription(survey.getDescription());
        dto.setStartDate(survey.getStartDate());
        dto.setEndDate(survey.getEndDate());
        dto.setStatus(survey.getStatus());

        if (survey.getCreatedBy() != null) {
            dto.setCreatedById(survey.getCreatedBy().getId());
            dto.setCreatedByName(survey.getCreatedBy().getName());
        }

        dto.setTotalResponses(responseRepository.countBySurveyId(survey.getId()));

        if (user != null) {
            dto.setHasParticipated(responseRepository.existsByUserIdAndSurveyId(user.getId(), survey.getId()));
        }

        dto.setQuestions(survey.getQuestions().stream()
                .map(this::mapQuestionToDto)
                .collect(Collectors.toList()));

        return dto;
    }

    public QuestionDto mapQuestionToDto(Question q) {
        QuestionDto dto = new QuestionDto();
        dto.setId(q.getId());
        dto.setQuestionText(q.getQuestionText());
        dto.setQuestionType(q.getQuestionType());
        dto.setOptions(q.getOptions().stream()
                .map(opt -> new OptionDto(opt.getId(), opt.getOptionText()))
                .collect(Collectors.toList()));
        return dto;
    }
}
