package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.entity.Author;
import com.researchscope.entity.Paper;
import com.researchscope.repository.AuthorRepository;
import com.researchscope.repository.PaperRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final PaperRepository paperRepository;
    private final PaperService paperService;

    public AuthorService(AuthorRepository authorRepository, PaperRepository paperRepository, PaperService paperService) {
        this.authorRepository = authorRepository;
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }

    public PaginatedResponse<AuthorDTO> searchAuthors(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Author> authorPage = authorRepository.searchAuthors((query != null && !query.isBlank()) ? query : null, pageable);

        List<AuthorDTO> dtos = authorPage.getContent().stream()
                .map(a -> new AuthorDTO(a.getId(), a.getName(), a.getOpenAlexId(), a.getPaperCount(), a.getCitationCount()))
                .toList();

        return new PaginatedResponse<>(
                dtos,
                authorPage.getNumber(),
                authorPage.getSize(),
                authorPage.getTotalElements(),
                authorPage.getTotalPages(),
                authorPage.isLast()
        );
    }

    public Optional<AuthorDTO> getAuthorById(String id) {
        return authorRepository.findById(id).map(a ->
                new AuthorDTO(a.getId(), a.getName(), a.getOpenAlexId(), a.getPaperCount(), a.getCitationCount())
        );
    }

    public List<PaperDTO> getPapersByAuthor(String authorId) {
        List<Paper> papers = paperRepository.findPapersByAuthorId(authorId);
        return papers.stream().map(paperService::toPaperDTO).toList();
    }
}
