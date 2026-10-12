package com.researchscope.service;

import com.researchscope.dto.InstitutionDTO;
import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.entity.Institution;
import com.researchscope.entity.Paper;
import com.researchscope.repository.InstitutionRepository;
import com.researchscope.repository.PaperRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final PaperRepository paperRepository;
    private final PaperService paperService;

    public InstitutionService(InstitutionRepository institutionRepository, PaperRepository paperRepository, PaperService paperService) {
        this.institutionRepository = institutionRepository;
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }

    public PaginatedResponse<InstitutionDTO> searchInstitutions(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Institution> pageResult = institutionRepository.searchInstitutions((query != null && !query.isBlank()) ? query : null, pageable);

        List<InstitutionDTO> dtos = pageResult.getContent().stream()
                .map(i -> new InstitutionDTO(i.getId(), i.getName(), i.getCountryCode(), i.getCountryCode(), i.getPaperCount()))
                .toList();

        return new PaginatedResponse<>(
                dtos,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    public Optional<InstitutionDTO> getInstitutionById(String id) {
        return institutionRepository.findById(id).map(i ->
                new InstitutionDTO(i.getId(), i.getName(), i.getCountryCode(), i.getCountryCode(), i.getPaperCount())
        );
    }

    public List<PaperDTO> getPapersByInstitution(String institutionId) {
        List<Paper> papers = paperRepository.findPapersByInstitutionId(institutionId);
        return papers.stream().map(paperService::toPaperDTO).toList();
    }
}
