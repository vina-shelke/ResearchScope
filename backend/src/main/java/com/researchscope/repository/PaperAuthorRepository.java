package com.researchscope.repository;

import com.researchscope.entity.PaperAuthor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperAuthorRepository extends JpaRepository<PaperAuthor, PaperAuthor.PaperAuthorId> {
    List<PaperAuthor> findByPaperId(String paperId);
    List<PaperAuthor> findByPaperIdIn(List<String> paperIds);
    List<PaperAuthor> findByAuthorId(String authorId);
}
