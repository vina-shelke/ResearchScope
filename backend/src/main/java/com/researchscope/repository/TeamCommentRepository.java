package com.researchscope.repository;

import com.researchscope.entity.TeamComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamCommentRepository extends JpaRepository<TeamComment, Long> {
    List<TeamComment> findByTeamIdAndPaperIdOrderByCreatedAtAsc(Long teamId, String paperId);
    void deleteByTeamId(Long teamId);
}
