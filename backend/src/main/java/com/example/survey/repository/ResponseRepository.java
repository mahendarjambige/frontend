package com.example.survey.repository;

import com.example.survey.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response> findBySurveyId(Long surveyId);
    List<Response> findByUserIdOrderBySubmittedAtDesc(Long userId);
    Optional<Response> findByUserIdAndSurveyId(Long userId, Long surveyId);
    boolean existsByUserIdAndSurveyId(Long userId, Long surveyId);
    long countBySurveyId(Long surveyId);
}
