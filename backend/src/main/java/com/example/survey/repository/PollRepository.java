package com.example.survey.repository;

import com.example.survey.entity.Poll;
import com.example.survey.entity.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByStatus(SurveyStatus status);
    List<Poll> findByCreatedById(Long userId);
    long countByStatus(SurveyStatus status);
}
