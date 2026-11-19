package com.researchscope.repository;

import com.researchscope.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamId(Long teamId);
    List<TeamMember> findByUserId(String userId);
    List<TeamMember> findByEmail(String email);
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, String userId);
    Optional<TeamMember> findByTeamIdAndEmail(Long teamId, String email);
    void deleteByTeamId(Long teamId);
}
