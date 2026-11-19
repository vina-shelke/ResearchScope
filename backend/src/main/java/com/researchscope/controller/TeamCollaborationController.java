package com.researchscope.controller;

import com.researchscope.config.AuthContext;
import com.researchscope.dto.*;
import com.researchscope.service.TeamCollaborationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamCollaborationController {

    private final TeamCollaborationService teamService;
    private final AuthContext authContext;

    public TeamCollaborationController(TeamCollaborationService teamService, AuthContext authContext) {
        this.teamService = teamService;
        this.authContext = authContext;
    }

    @PostMapping
    public ResponseEntity<ResearchTeamDTO> createTeam(
            @RequestBody CreateTeamRequest request,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        ResearchTeamDTO created = teamService.createTeam(userId, request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ResearchTeamDTO>> getUserTeams(HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        List<ResearchTeamDTO> teams = teamService.getUserTeams(userId);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<ResearchTeamDTO> getTeamDetails(
            @PathVariable Long teamId,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        ResearchTeamDTO team = teamService.getTeamDetails(teamId, userId);
        return ResponseEntity.ok(team);
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<ResearchTeamDTO> updateTeam(
            @PathVariable Long teamId,
            @RequestBody CreateTeamRequest request,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        ResearchTeamDTO updated = teamService.updateTeam(teamId, userId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Map<String, String>> deleteTeam(
            @PathVariable Long teamId,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        teamService.deleteTeam(teamId, userId);
        return ResponseEntity.ok(Map.of("message", "Team deleted successfully", "teamId", teamId.toString()));
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMemberDTO> addMember(
            @PathVariable Long teamId,
            @RequestBody AddTeamMemberRequest request,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        TeamMemberDTO member = teamService.addMember(teamId, userId, request);
        return ResponseEntity.ok(member);
    }

    @PutMapping("/{teamId}/members/{memberId}/role")
    public ResponseEntity<TeamMemberDTO> updateMemberRole(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> body,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        String role = body.get("role");
        TeamMemberDTO updated = teamService.updateMemberRole(teamId, memberId, userId, role);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        teamService.removeMember(teamId, memberId, userId);
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }

    @PostMapping("/{teamId}/papers")
    public ResponseEntity<TeamPaperDTO> addPaper(
            @PathVariable Long teamId,
            @RequestBody AddTeamPaperRequest request,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        TeamPaperDTO paper = teamService.addPaperToTeam(teamId, userId, request);
        return ResponseEntity.ok(paper);
    }

    @PutMapping("/{teamId}/papers/{teamPaperId}/assignment")
    public ResponseEntity<TeamPaperDTO> updatePaperAssignment(
            @PathVariable Long teamId,
            @PathVariable Long teamPaperId,
            @RequestBody AssignTeamPaperRequest request,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        TeamPaperDTO updated = teamService.updatePaperAssignment(teamId, teamPaperId, userId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{teamId}/papers/{teamPaperId}")
    public ResponseEntity<Map<String, String>> removePaper(
            @PathVariable Long teamId,
            @PathVariable Long teamPaperId,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        teamService.removePaperFromTeam(teamId, teamPaperId, userId);
        return ResponseEntity.ok(Map.of("message", "Paper removed from team workspace"));
    }

    @GetMapping("/{teamId}/papers/{paperId}/comments")
    public ResponseEntity<List<TeamCommentDTO>> getPaperComments(
            @PathVariable Long teamId,
            @PathVariable String paperId,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        List<TeamCommentDTO> comments = teamService.getPaperComments(teamId, paperId, userId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{teamId}/papers/{paperId}/comments")
    public ResponseEntity<TeamCommentDTO> addPaperComment(
            @PathVariable Long teamId,
            @PathVariable String paperId,
            @RequestBody AddTeamCommentRequest request,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        TeamCommentDTO created = teamService.addPaperComment(teamId, paperId, userId, request);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{teamId}/export/csv")
    public ResponseEntity<byte[]> exportTeamCsv(
            @PathVariable Long teamId,
            HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        String csv = teamService.exportTeamMatrixCsv(teamId, userId);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"team-" + teamId + "-literature-matrix.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
