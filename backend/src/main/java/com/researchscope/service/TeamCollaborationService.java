package com.researchscope.service;

import com.researchscope.dto.*;
import com.researchscope.entity.ResearchTeam;
import com.researchscope.entity.TeamComment;
import com.researchscope.entity.TeamMember;
import com.researchscope.entity.TeamPaper;
import com.researchscope.entity.User;
import com.researchscope.repository.ResearchTeamRepository;
import com.researchscope.repository.TeamCommentRepository;
import com.researchscope.repository.TeamMemberRepository;
import com.researchscope.repository.TeamPaperRepository;
import com.researchscope.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamCollaborationService {

    private final ResearchTeamRepository teamRepository;
    private final TeamMemberRepository memberRepository;
    private final TeamPaperRepository paperRepository;
    private final TeamCommentRepository commentRepository;
    private final UserRepository userRepository;

    public TeamCollaborationService(
            ResearchTeamRepository teamRepository,
            TeamMemberRepository memberRepository,
            TeamPaperRepository paperRepository,
            TeamCommentRepository commentRepository,
            UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.memberRepository = memberRepository;
        this.paperRepository = paperRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResearchTeamDTO createTeam(String userId, CreateTeamRequest request) {
        String teamName = (request.getName() != null && !request.getName().isBlank())
                ? request.getName().trim()
                : "Research Team " + UUID.randomUUID().toString().substring(0, 5);

        ResearchTeam team = new ResearchTeam(
                teamName,
                request.getDescription(),
                request.getInstitution(),
                userId
        );
        ResearchTeam savedTeam = teamRepository.save(team);

        // Fetch user name and email if available
        String email = userId;
        String name = userId;
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            email = userOpt.get().getEmail();
            name = userOpt.get().getUsername();
        }

        // Add creator as ADMIN
        TeamMember creatorMember = new TeamMember(
                savedTeam.getId(),
                userId,
                email,
                name,
                "ADMIN"
        );
        memberRepository.save(creatorMember);

        return toTeamDTO(savedTeam, userId);
    }

    public List<ResearchTeamDTO> getUserTeams(String userId) {
        // Find teams where user is member or creator
        List<TeamMember> memberships = memberRepository.findByUserId(userId);
        Set<Long> teamIds = memberships.stream().map(TeamMember::getTeamId).collect(Collectors.toSet());

        List<ResearchTeam> createdTeams = teamRepository.findByCreatedBy(userId);
        createdTeams.forEach(t -> teamIds.add(t.getId()));

        if (teamIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<ResearchTeam> teams = teamRepository.findAllById(teamIds);
        return teams.stream()
                .map(t -> toTeamDTO(t, userId))
                .sorted(Comparator.comparing(ResearchTeamDTO::getUpdatedAt).reversed())
                .collect(Collectors.toList());
    }

    public ResearchTeamDTO getTeamDetails(Long teamId, String userId) {
        ResearchTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

        validateUserAccess(teamId, userId);
        return toTeamDTO(team, userId);
    }

    @Transactional
    public ResearchTeamDTO updateTeam(Long teamId, String userId, CreateTeamRequest request) {
        ResearchTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

        validateAdminRole(teamId, userId);

        if (request.getName() != null && !request.getName().isBlank()) {
            team.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription().trim());
        }
        if (request.getInstitution() != null) {
            team.setInstitution(request.getInstitution().trim());
        }
        team.setUpdatedAt(LocalDateTime.now());
        ResearchTeam updated = teamRepository.save(team);

        return toTeamDTO(updated, userId);
    }

    @Transactional
    public void deleteTeam(Long teamId, String userId) {
        ResearchTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

        validateAdminRole(teamId, userId);

        memberRepository.deleteByTeamId(teamId);
        paperRepository.deleteByTeamId(teamId);
        commentRepository.deleteByTeamId(teamId);
        teamRepository.delete(team);
    }

    @Transactional
    public TeamMemberDTO addMember(Long teamId, String userId, AddTeamMemberRequest request) {
        validateAdminRole(teamId, userId);

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Member email cannot be empty");
        }
        String email = request.getEmail().trim().toLowerCase();

        // Check if member already exists in team
        Optional<TeamMember> existing = memberRepository.findByTeamIdAndEmail(teamId, email);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("User with email " + email + " is already in this team");
        }

        // Try to match registered user
        String memberUserId = email;
        String memberName = (request.getName() != null && !request.getName().isBlank())
                ? request.getName().trim()
                : email.split("@")[0];

        Optional<User> regUser = userRepository.findByEmail(email);
        if (regUser.isPresent()) {
            memberUserId = regUser.get().getId();
            memberName = regUser.get().getUsername();
        }

        String role = (request.getRole() != null && !request.getRole().isBlank())
                ? request.getRole().trim().toUpperCase()
                : "RESEARCHER";

        TeamMember member = new TeamMember(teamId, memberUserId, email, memberName, role);
        TeamMember saved = memberRepository.save(member);

        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setId(saved.getId());
        dto.setTeamId(saved.getTeamId());
        dto.setUserId(saved.getUserId());
        dto.setEmail(saved.getEmail());
        dto.setName(saved.getName());
        dto.setRole(saved.getRole());
        dto.setJoinedAt(saved.getJoinedAt());
        dto.setAssignedPapersCount(0);
        return dto;
    }

    @Transactional
    public TeamMemberDTO updateMemberRole(Long teamId, Long memberId, String userId, String newRole) {
        validateAdminRole(teamId, userId);

        TeamMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        if (!member.getTeamId().equals(teamId)) {
            throw new IllegalArgumentException("Member does not belong to specified team");
        }

        if (newRole != null && !newRole.isBlank()) {
            member.setRole(newRole.trim().toUpperCase());
        }
        TeamMember updated = memberRepository.save(member);

        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setId(updated.getId());
        dto.setTeamId(updated.getTeamId());
        dto.setUserId(updated.getUserId());
        dto.setEmail(updated.getEmail());
        dto.setName(updated.getName());
        dto.setRole(updated.getRole());
        dto.setJoinedAt(updated.getJoinedAt());
        return dto;
    }

    @Transactional
    public void removeMember(Long teamId, Long memberId, String userId) {
        TeamMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        if (!member.getTeamId().equals(teamId)) {
            throw new IllegalArgumentException("Member does not belong to specified team");
        }

        // Must be admin or removing self
        if (!member.getUserId().equals(userId)) {
            validateAdminRole(teamId, userId);
        }

        memberRepository.delete(member);
    }

    @Transactional
    public TeamPaperDTO addPaperToTeam(Long teamId, String userId, AddTeamPaperRequest request) {
        validateUserAccess(teamId, userId);

        if (request.getPaperId() == null || request.getPaperId().isBlank()) {
            throw new IllegalArgumentException("Paper ID cannot be empty");
        }

        Optional<TeamPaper> existing = paperRepository.findByTeamIdAndPaperId(teamId, request.getPaperId().trim());
        if (existing.isPresent()) {
            return toTeamPaperDTO(existing.get());
        }

        TeamPaper paper = new TeamPaper(
                teamId,
                request.getPaperId().trim(),
                request.getTitle() != null ? request.getTitle().trim() : "Untitled Study",
                request.getAuthors(),
                request.getPublicationYear(),
                request.getVenue(),
                request.getDoi(),
                userId
        );

        if (request.getAssignedToUserId() != null && !request.getAssignedToUserId().isBlank()) {
            paper.setAssignedToUserId(request.getAssignedToUserId().trim());
            paper.setAssignedToName(request.getAssignedToName() != null ? request.getAssignedToName().trim() : request.getAssignedToUserId());
        }

        TeamPaper saved = paperRepository.save(paper);
        return toTeamPaperDTO(saved);
    }

    @Transactional
    public TeamPaperDTO updatePaperAssignment(Long teamId, Long teamPaperId, String userId, AssignTeamPaperRequest request) {
        validateUserAccess(teamId, userId);

        TeamPaper paper = paperRepository.findById(teamPaperId)
                .orElseThrow(() -> new IllegalArgumentException("Team paper not found with ID: " + teamPaperId));

        if (!paper.getTeamId().equals(teamId)) {
            throw new IllegalArgumentException("Paper does not belong to specified team");
        }

        if (request.getAssignedToUserId() != null) {
            paper.setAssignedToUserId(request.getAssignedToUserId().trim());
            paper.setAssignedToName(request.getAssignedToName() != null ? request.getAssignedToName().trim() : request.getAssignedToUserId());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            paper.setStatus(request.getStatus().trim().toUpperCase());
        }

        if (request.getNotes() != null) {
            paper.setNotes(request.getNotes().trim());
        }

        if (request.getConsensus() != null && !request.getConsensus().isBlank()) {
            paper.setConsensus(request.getConsensus().trim().toUpperCase());
        }

        TeamPaper updated = paperRepository.save(paper);
        return toTeamPaperDTO(updated);
    }

    @Transactional
    public void removePaperFromTeam(Long teamId, Long teamPaperId, String userId) {
        validateUserAccess(teamId, userId);

        TeamPaper paper = paperRepository.findById(teamPaperId)
                .orElseThrow(() -> new IllegalArgumentException("Team paper not found with ID: " + teamPaperId));

        if (!paper.getTeamId().equals(teamId)) {
            throw new IllegalArgumentException("Paper does not belong to specified team");
        }

        paperRepository.delete(paper);
    }

    public List<TeamCommentDTO> getPaperComments(Long teamId, String paperId, String userId) {
        validateUserAccess(teamId, userId);
        List<TeamComment> comments = commentRepository.findByTeamIdAndPaperIdOrderByCreatedAtAsc(teamId, paperId);
        return comments.stream().map(this::toTeamCommentDTO).collect(Collectors.toList());
    }

    @Transactional
    public TeamCommentDTO addPaperComment(Long teamId, String paperId, String userId, AddTeamCommentRequest request) {
        validateUserAccess(teamId, userId);

        if (request.getCommentText() == null || request.getCommentText().isBlank()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }

        String authorName = userId;
        Optional<User> uOpt = userRepository.findById(userId);
        if (uOpt.isPresent()) {
            authorName = uOpt.get().getUsername();
        } else {
            Optional<TeamMember> mOpt = memberRepository.findByTeamIdAndUserId(teamId, userId);
            if (mOpt.isPresent()) {
                authorName = mOpt.get().getName();
            }
        }

        TeamComment comment = new TeamComment(
                teamId,
                paperId,
                userId,
                authorName,
                request.getCommentText().trim(),
                request.getConsensusVote()
        );
        TeamComment saved = commentRepository.save(comment);

        // Update paper consensus tally if vote was cast
        if (request.getConsensusVote() != null && !"NONE".equalsIgnoreCase(request.getConsensusVote())) {
            updatePaperConsensusTally(teamId, paperId);
        }

        return toTeamCommentDTO(saved);
    }

    private void updatePaperConsensusTally(Long teamId, String paperId) {
        Optional<TeamPaper> paperOpt = paperRepository.findByTeamIdAndPaperId(teamId, paperId);
        if (paperOpt.isEmpty()) return;

        List<TeamComment> comments = commentRepository.findByTeamIdAndPaperIdOrderByCreatedAtAsc(teamId, paperId);
        long agree = comments.stream().filter(c -> "AGREE".equalsIgnoreCase(c.getConsensusVote())).count();
        long disagree = comments.stream().filter(c -> "DISAGREE".equalsIgnoreCase(c.getConsensusVote())).count();

        TeamPaper paper = paperOpt.get();
        if (agree > disagree && agree > 0) {
            paper.setConsensus("AGREE");
        } else if (disagree > agree && disagree > 0) {
            paper.setConsensus("DISAGREE");
        } else if (agree > 0 && agree == disagree) {
            paper.setConsensus("NEUTRAL");
        }
        paperRepository.save(paper);
    }

    public String exportTeamMatrixCsv(Long teamId, String userId) {
        validateUserAccess(teamId, userId);
        ResearchTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        List<TeamPaper> papers = paperRepository.findByTeamIdOrderByAddedAtDesc(teamId);

        StringBuilder sb = new StringBuilder();
        sb.append("Team: \"").append(team.getName()).append("\"\n");
        sb.append("Institution: \"").append(team.getInstitution() != null ? team.getInstitution() : "").append("\"\n");
        sb.append("Exported: ").append(LocalDateTime.now()).append("\n\n");

        sb.append("Paper Title,Authors,Year,Venue,DOI,Review Status,Assigned Researcher,Consensus,Collaborative Notes\n");

        for (TeamPaper p : papers) {
            sb.append("\"").append(cleanCsv(p.getTitle())).append("\",");
            sb.append("\"").append(cleanCsv(p.getAuthors())).append("\",");
            sb.append(p.getPublicationYear() != null ? p.getPublicationYear() : "").append(",");
            sb.append("\"").append(cleanCsv(p.getVenue())).append("\",");
            sb.append("\"").append(cleanCsv(p.getDoi())).append("\",");
            sb.append("\"").append(p.getStatus()).append("\",");
            sb.append("\"").append(cleanCsv(p.getAssignedToName())).append("\",");
            sb.append("\"").append(p.getConsensus()).append("\",");
            sb.append("\"").append(cleanCsv(p.getNotes())).append("\"\n");
        }

        return sb.toString();
    }

    private String cleanCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }

    private void validateUserAccess(Long teamId, String userId) {
        ResearchTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        if (team.getCreatedBy().equalsIgnoreCase(userId)) {
            return;
        }

        Optional<TeamMember> member = memberRepository.findByTeamIdAndUserId(teamId, userId);
        if (member.isEmpty()) {
            throw new SecurityException("User does not have access to team ID: " + teamId);
        }
    }

    private void validateAdminRole(Long teamId, String userId) {
        ResearchTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        if (team.getCreatedBy().equalsIgnoreCase(userId)) {
            return;
        }

        TeamMember member = memberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new SecurityException("User does not belong to team: " + teamId));

        if (!"ADMIN".equalsIgnoreCase(member.getRole())) {
            throw new SecurityException("Admin privileges required for this team operation");
        }
    }

    private ResearchTeamDTO toTeamDTO(ResearchTeam team, String currentUserId) {
        ResearchTeamDTO dto = new ResearchTeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setInstitution(team.getInstitution());
        dto.setCreatedBy(team.getCreatedBy());
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());

        // Determine user role
        String role = "VIEWER";
        if (team.getCreatedBy().equalsIgnoreCase(currentUserId)) {
            role = "ADMIN";
        } else {
            Optional<TeamMember> mOpt = memberRepository.findByTeamIdAndUserId(team.getId(), currentUserId);
            if (mOpt.isPresent()) {
                role = mOpt.get().getRole();
            }
        }
        dto.setCurrentUserRole(role);

        // Fetch members
        List<TeamMember> members = memberRepository.findByTeamId(team.getId());
        List<TeamPaper> papers = paperRepository.findByTeamIdOrderByAddedAtDesc(team.getId());

        Map<String, Long> assignmentCounts = papers.stream()
                .filter(p -> p.getAssignedToUserId() != null)
                .collect(Collectors.groupingBy(TeamPaper::getAssignedToUserId, Collectors.counting()));

        List<TeamMemberDTO> memberDTOs = members.stream().map(m -> {
            TeamMemberDTO md = new TeamMemberDTO();
            md.setId(m.getId());
            md.setTeamId(m.getTeamId());
            md.setUserId(m.getUserId());
            md.setEmail(m.getEmail());
            md.setName(m.getName());
            md.setRole(m.getRole());
            md.setJoinedAt(m.getJoinedAt());
            md.setAssignedPapersCount(assignmentCounts.getOrDefault(m.getUserId(), 0L));
            return md;
        }).collect(Collectors.toList());

        dto.setMembers(memberDTOs);

        // Fetch papers
        List<TeamPaperDTO> paperDTOs = papers.stream().map(this::toTeamPaperDTO).collect(Collectors.toList());
        dto.setPapers(paperDTOs);

        dto.setTotalPapers(papers.size());
        dto.setReviewedPapers(papers.stream().filter(p -> "REVIEWED".equalsIgnoreCase(p.getStatus())).count());
        dto.setInProgressPapers(papers.stream().filter(p -> "IN_PROGRESS".equalsIgnoreCase(p.getStatus())).count());
        dto.setToReadPapers(papers.stream().filter(p -> "TO_READ".equalsIgnoreCase(p.getStatus())).count());

        return dto;
    }

    private TeamPaperDTO toTeamPaperDTO(TeamPaper p) {
        TeamPaperDTO dto = new TeamPaperDTO();
        dto.setId(p.getId());
        dto.setTeamId(p.getTeamId());
        dto.setPaperId(p.getPaperId());
        dto.setTitle(p.getTitle());
        dto.setAuthors(p.getAuthors());
        dto.setPublicationYear(p.getPublicationYear());
        dto.setVenue(p.getVenue());
        dto.setDoi(p.getDoi());
        dto.setStatus(p.getStatus());
        dto.setAssignedToUserId(p.getAssignedToUserId());
        dto.setAssignedToName(p.getAssignedToName());
        dto.setConsensus(p.getConsensus());
        dto.setNotes(p.getNotes());
        dto.setAddedBy(p.getAddedBy());
        dto.setAddedAt(p.getAddedAt());
        return dto;
    }

    private TeamCommentDTO toTeamCommentDTO(TeamComment c) {
        TeamCommentDTO dto = new TeamCommentDTO();
        dto.setId(c.getId());
        dto.setTeamId(c.getTeamId());
        dto.setPaperId(c.getPaperId());
        dto.setAuthorId(c.getAuthorId());
        dto.setAuthorName(c.getAuthorName());
        dto.setCommentText(c.getCommentText());
        dto.setConsensusVote(c.getConsensusVote());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
