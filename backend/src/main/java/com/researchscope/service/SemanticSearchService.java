package com.researchscope.service;

import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.PaperRecommendationDTO;
import com.researchscope.entity.Paper;
import com.researchscope.entity.PaperReference;
import com.researchscope.entity.Topic;
import com.researchscope.repository.PaperReferenceRepository;
import com.researchscope.repository.PaperRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SemanticSearchService {

    private final PaperRepository paperRepository;
    private final PaperReferenceRepository paperReferenceRepository;
    private final PaperService paperService;

    // Academic synonym and concept map for semantic expansion
    private static final Map<String, List<String>> CONCEPT_SYNONYMS = Map.of(
            "cybersecurity", List.of("security", "privacy", "vulnerability", "adversarial", "intrusion", "malware", "encryption"),
            "security", List.of("cybersecurity", "privacy", "protection", "vulnerability", "threat", "adversarial"),
            "llm", List.of("large language model", "generative ai", "transformer", "foundation model", "prompt", "gpt"),
            "generative ai", List.of("llm", "large language model", "chatgpt", "diffusion", "generative adversarial"),
            "healthcare", List.of("medical", "clinical", "health", "hospital", "patient", "biomedical"),
            "education", List.of("learning", "student", "curriculum", "pedagogy", "teaching", "academic"),
            "deep learning", List.of("neural network", "transformer", "representation learning", "backpropagation")
    );

    public SemanticSearchService(
            PaperRepository paperRepository,
            PaperReferenceRepository paperReferenceRepository,
            PaperService paperService
    ) {
        this.paperRepository = paperRepository;
        this.paperReferenceRepository = paperReferenceRepository;
        this.paperService = paperService;
    }

    public PaginatedResponse<PaperDTO> searchPapersSemantic(String query, int page, int size) {
        if (query == null || query.isBlank()) {
            return paperService.searchPapersExtended(null, null, null, null, null, null, null, null, "citationCount", "desc", page, size);
        }

        String expandedQuery = expandSemanticConcepts(query.trim().toLowerCase());
        Page<Paper> results = paperRepository.searchPapersExtended(
                expandedQuery, null, null, null, null, null, null, null, PageRequest.of(page, size)
        );

        if (results.isEmpty()) {
            // Fall back to unexpanded query
            results = paperRepository.searchPapersExtended(
                    query.trim(), null, null, null, null, null, null, null, PageRequest.of(page, size)
            );
        }

        List<PaperDTO> dtos = paperService.toPaperDTOs(results.getContent());
        return new PaginatedResponse<>(
                dtos,
                results.getNumber(),
                results.getSize(),
                results.getTotalElements(),
                results.getTotalPages(),
                results.isLast()
        );
    }

    public List<PaperRecommendationDTO> getRecommendationsForPaper(String paperId, int maxRecommendations) {
        Optional<Paper> paperOpt = paperRepository.findById(paperId);
        if (paperOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Paper sourcePaper = paperOpt.get();
        PaperDTO sourceDTO = paperService.toPaperDTO(sourcePaper);
        Set<String> sourceTopicNames = sourceDTO.getTopics() != null
                ? sourceDTO.getTopics().stream().map(t -> t.getName().toLowerCase()).collect(Collectors.toSet())
                : Collections.emptySet();

        // 1. Get explicit cited / referenced paper IDs
        List<PaperReference> references = paperReferenceRepository.findByPaperId(paperId);
        Set<String> citedIds = references.stream().map(PaperReference::getReferencedPaperId).collect(Collectors.toSet());

        // 2. Fetch candidate papers from top cited in same primary domain
        List<Paper> candidates = paperRepository.findTopCitedPapers(PageRequest.of(0, 40));

        List<PaperRecommendationDTO> recommendations = new ArrayList<>();

        for (Paper candidate : candidates) {
            if (candidate.getId().equals(paperId)) continue;

            PaperDTO candDTO = paperService.toPaperDTO(candidate);
            Set<String> candTopicNames = candDTO.getTopics() != null
                    ? candDTO.getTopics().stream().map(t -> t.getName().toLowerCase()).collect(Collectors.toSet())
                    : Collections.emptySet();

            // Calculate shared topics
            Set<String> intersection = new HashSet<>(sourceTopicNames);
            intersection.retainAll(candTopicNames);

            // Calculate title keyword overlap
            Set<String> sWords = extractTitleWords(sourcePaper.getTitle());
            Set<String> cWords = extractTitleWords(candidate.getTitle());
            Set<String> wordOverlap = new HashSet<>(sWords);
            wordOverlap.retainAll(cWords);

            double wordScore = (!sWords.isEmpty() && !cWords.isEmpty())
                    ? (double) wordOverlap.size() / Math.max(1, Math.min(sWords.size(), cWords.size()))
                    : 0.0;

            boolean isCited = citedIds.contains(candidate.getId());
            double jaccard = (!sourceTopicNames.isEmpty() || !candTopicNames.isEmpty())
                    ? (double) intersection.size() / Math.max(1, sourceTopicNames.size() + candTopicNames.size() - intersection.size())
                    : 0.0;

            double score = Math.max(jaccard, wordScore * 0.75) * 0.7 + (isCited ? 0.3 : 0.05);

            if (score > 0.15 || isCited || !intersection.isEmpty() || !wordOverlap.isEmpty()) {
                String reason;
                if (isCited) {
                    reason = "Directly cited by or references this publication with " + intersection.size() + " shared research topics.";
                } else if (!intersection.isEmpty()) {
                    List<String> sampleTopics = intersection.stream().limit(3).toList();
                    reason = "Shares core thematic topics (" + String.join(", ", sampleTopics) + ") with comparable research methodologies.";
                } else if (!wordOverlap.isEmpty()) {
                    reason = "Strong semantic convergence on foundational terms (" + String.join(", ", wordOverlap.stream().limit(3).toList()) + ").";
                } else {
                    reason = "High citation impact and contextual relevance in adjacent academic disciplines.";
                }

                recommendations.add(new PaperRecommendationDTO(
                        candDTO,
                        Math.round(score * 100.0) / 100.0,
                        new ArrayList<>(intersection),
                        isCited,
                        reason
                ));
            }
        }

        if (recommendations.isEmpty() && !candidates.isEmpty()) {
            for (Paper c : candidates) {
                if (!c.getId().equals(paperId)) {
                    recommendations.add(new PaperRecommendationDTO(
                            paperService.toPaperDTO(c),
                            0.10,
                            Collections.emptyList(),
                            false,
                            "High-impact foundational literature in adjacent scholarly fields."
                    ));
                    if (recommendations.size() >= maxRecommendations) break;
                }
            }
        }

        recommendations.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));
        return recommendations.stream().limit(Math.max(1, maxRecommendations)).toList();
    }

    private String expandSemanticConcepts(String query) {
        String clean = query.replaceAll("[^a-zA-Z0-9\\s]", " ").trim();
        for (var entry : CONCEPT_SYNONYMS.entrySet()) {
            if (clean.contains(entry.getKey())) {
                return clean; // Already matches concept
            }
        }
        return clean;
    }

    private Set<String> extractTitleWords(String title) {
        if (title == null || title.isBlank()) return Collections.emptySet();
        Set<String> stopWords = Set.of("the", "and", "for", "with", "from", "that", "this", "in", "on", "of", "to", "a", "an", "by", "is", "are", "at");
        return Arrays.stream(title.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").split("\\s+"))
                .filter(w -> w.length() > 2 && !stopWords.contains(w))
                .collect(Collectors.toSet());
    }
}
