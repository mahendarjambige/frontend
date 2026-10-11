package com.example.survey.service;

import com.example.survey.dto.PollDto;
import com.example.survey.dto.PollOptionDto;
import com.example.survey.entity.*;
import com.example.survey.exception.BadRequestException;
import com.example.survey.exception.ResourceNotFoundException;
import com.example.survey.repository.PollOptionRepository;
import com.example.survey.repository.PollRepository;
import com.example.survey.repository.PollVoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;

    public PollService(PollRepository pollRepository,
                       PollOptionRepository pollOptionRepository,
                       PollVoteRepository pollVoteRepository) {
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.pollVoteRepository = pollVoteRepository;
    }

    public List<PollDto> getAllPolls() {
        return pollRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PollDto> getActivePolls(User currentUser) {
        return pollRepository.findByStatus(SurveyStatus.PUBLISHED).stream()
                .map(p -> mapToDtoWithUserVote(p, currentUser))
                .collect(Collectors.toList());
    }

    public PollDto getPollById(Long id, User currentUser) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + id));
        return mapToDtoWithUserVote(poll, currentUser);
    }

    @Transactional
    public PollDto createPoll(PollDto dto, User creator) {
        Poll poll = new Poll();
        poll.setTitle(dto.getTitle());
        poll.setDescription(dto.getDescription());
        poll.setStartDate(dto.getStartDate());
        poll.setEndDate(dto.getEndDate());
        poll.setStatus(dto.getStatus() != null ? dto.getStatus() : SurveyStatus.DRAFT);
        poll.setCreatedBy(creator);

        if (dto.getOptions() != null) {
            for (PollOptionDto optDto : dto.getOptions()) {
                PollOption option = new PollOption();
                option.setOptionText(optDto.getOptionText());
                poll.addOption(option);
            }
        }

        Poll saved = pollRepository.save(poll);
        return mapToDto(saved);
    }

    @Transactional
    public PollDto updatePoll(Long id, PollDto dto) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + id));

        poll.setTitle(dto.getTitle());
        poll.setDescription(dto.getDescription());
        poll.setStartDate(dto.getStartDate());
        poll.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) {
            poll.setStatus(dto.getStatus());
        }

        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            poll.getOptions().clear();
            for (PollOptionDto optDto : dto.getOptions()) {
                PollOption option = new PollOption();
                option.setOptionText(optDto.getOptionText());
                poll.addOption(option);
            }
        }

        Poll saved = pollRepository.save(poll);
        return mapToDto(saved);
    }

    @Transactional
    public PollDto updatePollStatus(Long id, SurveyStatus status) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + id));
        poll.setStatus(status);
        Poll saved = pollRepository.save(poll);
        return mapToDto(saved);
    }

    @Transactional
    public void deletePoll(Long id) {
        if (!pollRepository.existsById(id)) {
            throw new ResourceNotFoundException("Poll not found with id: " + id);
        }
        pollRepository.deleteById(id);
    }

    @Transactional
    public PollDto vote(Long pollId, Long optionId, User user) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        if (poll.getStatus() != SurveyStatus.PUBLISHED) {
            throw new BadRequestException("Poll is not open for voting. Current status: " + poll.getStatus());
        }

        if (pollVoteRepository.existsByUserIdAndPollId(user.getId(), pollId)) {
            throw new BadRequestException("You have already voted in this poll");
        }

        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll option not found with id: " + optionId));

        if (!option.getPoll().getId().equals(pollId)) {
            throw new BadRequestException("Selected option does not belong to this poll");
        }

        PollVote vote = new PollVote();
        vote.setPoll(poll);
        vote.setUser(user);
        vote.setOption(option);
        pollVoteRepository.save(vote);

        return mapToDtoWithUserVote(poll, user);
    }

    public PollDto mapToDto(Poll poll) {
        return mapToDtoWithUserVote(poll, null);
    }

    public PollDto mapToDtoWithUserVote(Poll poll, User user) {
        PollDto dto = new PollDto();
        dto.setId(poll.getId());
        dto.setTitle(poll.getTitle());
        dto.setDescription(poll.getDescription());
        dto.setStartDate(poll.getStartDate());
        dto.setEndDate(poll.getEndDate());
        dto.setStatus(poll.getStatus());

        if (poll.getCreatedBy() != null) {
            dto.setCreatedById(poll.getCreatedBy().getId());
            dto.setCreatedByName(poll.getCreatedBy().getName());
        }

        long totalVotes = pollVoteRepository.countByPollId(poll.getId());
        dto.setTotalVotes(totalVotes);

        if (user != null) {
            Optional<PollVote> voteOpt = pollVoteRepository.findByUserIdAndPollId(user.getId(), poll.getId());
            if (voteOpt.isPresent()) {
                dto.setHasVoted(true);
                dto.setSelectedOptionId(voteOpt.get().getOption().getId());
            } else {
                dto.setHasVoted(false);
            }
        }

        List<PollOptionDto> optionDtos = poll.getOptions().stream().map(opt -> {
            long count = pollVoteRepository.countByOptionId(opt.getId());
            double percentage = totalVotes > 0 ? ((double) count / totalVotes) * 100.0 : 0.0;
            return new PollOptionDto(opt.getId(), opt.getOptionText(), count, Math.round(percentage * 10.0) / 10.0);
        }).collect(Collectors.toList());

        dto.setOptions(optionDtos);

        return dto;
    }
}
