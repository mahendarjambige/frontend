package com.example.survey.repository;

import com.example.survey.entity.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {
    List<PollVote> findByPollId(Long pollId);
    List<PollVote> findByUserIdOrderByVotedAtDesc(Long userId);
    Optional<PollVote> findByUserIdAndPollId(Long userId, Long pollId);
    boolean existsByUserIdAndPollId(Long userId, Long pollId);
    long countByPollId(Long pollId);
    long countByOptionId(Long optionId);
}
