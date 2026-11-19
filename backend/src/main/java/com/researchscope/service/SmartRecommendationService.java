package com.researchscope.service;

import com.researchscope.dto.CreateAlertRequest;
import com.researchscope.dto.RecommendationItemDTO;
import com.researchscope.entity.*;
import com.researchscope.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SmartRecommendationService {

    private final PaperRepository paperRepository;
    private final SavedPaperRepository savedPaperRepository;
    private final ResearchProjectRepository projectRepository;
    private final ResearchAlertRepository alertRepository;
    private final PaperAuthorRepository paperAuthorRepository;
    private final AuthorRepository authorRepository;

    public SmartRecommendationService(
            PaperRepository paperRepository,
            SavedPaperRepository savedPaperRepository,
            ResearchProjectRepository projectRepository,
            ResearchAlertRepository alertRepository,
            PaperAuthorRepository paperAuthorRepository,
            AuthorRepository authorRepository) {
        this.paperRepository = paperRepository;
        this.savedPaperRepository = savedPaperRepository;
        this.projectRepository = projectRepository;
        this.alertRepository = alertRepository;
        this.paperAuthorRepository = paperAuthorRepository;
        this.authorRepository = authorRepository;
    }

    public List<RecommendationItemDTO> getPersonalizedRecommendations(String userId, int limit) {
        int maxResults = (limit > 0 && limit <= 50) ? limit : 10;

        List<SavedPaper> savedPapers = savedPaperRepository.findByUserIdOrderBySavedAtDesc(userId);
        List<ResearchProject> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Set<String> savedPaperIds = savedPapers.stream().map(SavedPaper::getPaperId).collect(Collectors.toSet());

        // Extract domain keywords from saved papers and projects
        Set<String> interestKeywords = new LinkedHashSet<>();
        for (ResearchProject p : projects) {
            extractSignificantWords(p.getTitle(), interestKeywords);
            extractSignificantWords(p.getDescription(), interestKeywords);
        }

        if (!savedPaperIds.isEmpty()) {
            List<Paper> userPapers = paperRepository.findAllById(savedPaperIds);
            for (Paper p : userPapers) {
                extractSignificantWords(p.getTitle(), interestKeywords);
            }
        }

        for (SavedPaper sp : savedPapers) {
            if (sp.getCollectionName() != null) {
                extractSignificantWords(sp.getCollectionName(), interestKeywords);
            }
        }

        // Fetch candidate papers
        List<Paper> candidatePapers = new ArrayList<>();
        if (!interestKeywords.isEmpty()) {
            for (String kw : interestKeywords) {
                if (candidatePapers.size() >= 40) break;
                List<Paper> matches = paperRepository.findTopCitedPapersByQuery(kw, PageRequest.of(0, 8));
                candidatePapers.addAll(matches);
            }
        }

        // If candidates are few, supplement with top-cited papers
        if (candidatePapers.size() < 20) {
            List<Paper> topCited = paperRepository.findTopCitedPapers(PageRequest.of(0, 25));
            candidatePapers.addAll(topCited);
        }

        // De-duplicate candidates by ID
        Map<String, Paper> uniqueCandidates = new LinkedHashMap<>();
        for (Paper p : candidatePapers) {
            uniqueCandidates.putIfAbsent(p.getId(), p);
        }

        // Batch load authors for candidates
        List<String> candIds = new ArrayList<>(uniqueCandidates.keySet());
        Map<String, List<String>> authorMap = loadAuthorsForPapers(candIds);

        // Score and rank candidates
        List<RecommendationItemDTO> results = new ArrayList<>();
        int currentYear = LocalDateTime.now().getYear();

        for (Paper p : uniqueCandidates.values()) {
            boolean isSaved = savedPaperIds.contains(p.getId());

            // Calculate relevance score (0-100)
            int score = 40; // baseline quality score
            List<String> matchedTopics = new ArrayList<>();
            String matchedReason = "High-impact literature in contemporary academic research";

            String titleLower = p.getTitle() != null ? p.getTitle().toLowerCase() : "";
            String abstractLower = p.getAbstractText() != null ? p.getAbstractText().toLowerCase() : "";

            // 1. Keyword match (up to 35 points)
            int kwMatches = 0;
            for (String kw : interestKeywords) {
                if (titleLower.contains(kw.toLowerCase()) || abstractLower.contains(kw.toLowerCase())) {
                    kwMatches++;
                    if (matchedTopics.size() < 4) {
                        matchedTopics.add(kw);
                    }
                }
            }
            if (kwMatches > 0) {
                score += Math.min(35, kwMatches * 12);
                matchedReason = "Directly aligned with your research in '" + String.join(", ", matchedTopics) + "'";
            } else if (!savedPapers.isEmpty()) {
                matchedReason = "Related methodological paradigms to your active research corpus";
            }

            // 2. Citation velocity & impact (up to 15 points)
            int citations = p.getCitationCount() != null ? p.getCitationCount() : 0;
            if (citations >= 100) score += 15;
            else if (citations >= 30) score += 10;
            else if (citations >= 5) score += 5;

            // 3. Recency (up to 10 points)
            int year = p.getPublicationYear() != null ? p.getPublicationYear() : currentYear - 5;
            if (year >= currentYear - 2) score += 10;
            else if (year >= currentYear - 5) score += 5;

            // Cap at 98% (grounded realism)
            score = Math.min(98, Math.max(50, score));

            RecommendationItemDTO dto = new RecommendationItemDTO();
            dto.setPaperId(p.getId());
            dto.setTitle(p.getTitle());
            dto.setAuthors(authorMap.getOrDefault(p.getId(), Collections.emptyList()));
            dto.setPublicationYear(p.getPublicationYear());
            dto.setVenue(p.getVenue());
            dto.setCitationCount(p.getCitationCount());
            dto.setIsOpenAccess(p.getIsOpenAccess());
            dto.setDoi(p.getDoi());
            dto.setRelevanceScore(score);
            dto.setMatchedReason(matchedReason);
            dto.setMatchingTopics(matchedTopics.isEmpty() ? List.of("Empirical Study", "Academic Literature") : matchedTopics);
            dto.setSavedInWorkspace(isSaved);

            results.add(dto);
        }

        // Sort by score descending and return top N
        return results.stream()
                .sorted(Comparator.comparingInt(RecommendationItemDTO::getRelevanceScore).reversed())
                .limit(maxResults)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResearchAlert subscribeAlert(String userId, CreateAlertRequest request) {
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            throw new IllegalArgumentException("Search query or topic cannot be empty");
        }
        ResearchAlert alert = new ResearchAlert(
                userId,
                request.getQuery().trim(),
                request.getFrequency()
        );
        return alertRepository.save(alert);
    }

    public List<ResearchAlert> getUserAlerts(String userId) {
        return alertRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void deleteAlert(String userId, Long alertId) {
        ResearchAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found with ID: " + alertId));
        if (!alert.getUserId().equalsIgnoreCase(userId)) {
            throw new SecurityException("Unauthorized to delete this research alert");
        }
        alertRepository.delete(alert);
    }

    public List<Map<String, Object>> getAlertNotifications(String userId) {
        List<ResearchAlert> alerts = alertRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (alerts.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> notifications = new ArrayList<>();
        for (ResearchAlert a : alerts) {
            List<Paper> matches = paperRepository.findTopCitedPapersByQuery(a.getQuery(), PageRequest.of(0, 3));
            for (Paper p : matches) {
                notifications.add(Map.of(
                        "alertId", a.getId(),
                        "topicQuery", a.getQuery(),
                        "frequency", a.getFrequency(),
                        "paperId", p.getId(),
                        "paperTitle", p.getTitle(),
                        "publicationYear", p.getPublicationYear() != null ? p.getPublicationYear() : 0,
                        "venue", p.getVenue() != null ? p.getVenue() : "Scholarly Publication",
                        "citationCount", p.getCitationCount() != null ? p.getCitationCount() : 0,
                        "timestamp", a.getCreatedAt()
                ));
            }
        }
        return notifications;
    }

    private void extractSignificantWords(String text, Set<String> target) {
        if (text == null || text.isBlank()) return;
        String[] words = text.split("[\\s,;:.\\-_/()]+");
        Set<String> stopWords = Set.of("the", "and", "for", "with", "from", "that", "this", "project", "research", "study", "analysis", "using", "into");
        for (String w : words) {
            String clean = w.trim().toLowerCase();
            if (clean.length() >= 4 && !stopWords.contains(clean)) {
                target.add(clean);
            }
        }
    }

    private Map<String, List<String>> loadAuthorsForPapers(List<String> paperIds) {
        if (paperIds.isEmpty()) return Collections.emptyMap();
        List<PaperAuthor> paList = paperAuthorRepository.findByPaperIdIn(paperIds);
        if (paList.isEmpty()) return Collections.emptyMap();

        Set<String> authorIds = paList.stream().map(PaperAuthor::getAuthorId).collect(Collectors.toSet());
        List<Author> authors = authorRepository.findAllById(authorIds);
        Map<String, String> authorNameMap = authors.stream().collect(Collectors.toMap(Author::getId, Author::getName, (a, b) -> a));

        Map<String, List<String>> result = new HashMap<>();
        for (PaperAuthor pa : paList) {
            String aName = authorNameMap.get(pa.getAuthorId());
            if (aName != null) {
                result.computeIfAbsent(pa.getPaperId(), k -> new ArrayList<>()).add(aName);
            }
        }
        return result;
    }
}
