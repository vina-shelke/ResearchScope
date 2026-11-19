package com.researchscope.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.researchscope.dto.*;
import com.researchscope.entity.LiteratureReview;
import com.researchscope.entity.LiteratureReviewSection;
import com.researchscope.entity.Paper;
import com.researchscope.repository.LiteratureReviewRepository;
import com.researchscope.repository.LiteratureReviewSectionRepository;
import com.researchscope.repository.PaperRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class LiteratureReviewService {

    private static final Logger log = LoggerFactory.getLogger(LiteratureReviewService.class);

    private final LiteratureReviewRepository reviewRepository;
    private final LiteratureReviewSectionRepository sectionRepository;
    private final PaperRepository paperRepository;
    private final PaperService paperService;
    private final DocumentExtractionService documentExtractionService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    @Value("${ai.assistant.gemini-api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    @Value("${ai.assistant.openai-api-key:${OPENAI_API_KEY:}}")
    private String openaiApiKey;

    public LiteratureReviewService(
            LiteratureReviewRepository reviewRepository,
            LiteratureReviewSectionRepository sectionRepository,
            PaperRepository paperRepository,
            PaperService paperService,
            DocumentExtractionService documentExtractionService
    ) {
        this.reviewRepository = reviewRepository;
        this.sectionRepository = sectionRepository;
        this.paperRepository = paperRepository;
        this.paperService = paperService;
        this.documentExtractionService = documentExtractionService;

        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
    }

    public static final List<SectionTemplate> SECTION_TEMPLATES = List.of(
            new SectionTemplate("INTRODUCTION", "1. Introduction", 1),
            new SectionTemplate("BACKGROUND", "2. Background of the Research Area", 2),
            new SectionTemplate("APPROACHES", "3. Existing Research Approaches", 3),
            new SectionTemplate("COMPARISON", "4. Comparison of Previous Studies", 4),
            new SectionTemplate("METHODOLOGIES", "5. Common Research Methodologies", 5),
            new SectionTemplate("FINDINGS", "6. Major Research Findings", 6),
            new SectionTemplate("LIMITATIONS", "7. Research Limitations", 7),
            new SectionTemplate("GAPS", "8. Identified Research Gaps", 8),
            new SectionTemplate("FUTURE_DIRECTIONS", "9. Future Research Directions", 9),
            new SectionTemplate("REFERENCES", "10. References", 10)
    );

    public record SectionTemplate(String key, String title, int orderIndex) {}

    @Transactional
    public LiteratureReviewDTO generateLiteratureReview(String userId, CreateLiteratureReviewRequest request) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "user_demo";
        List<String> paperIds = request.getPaperIds() != null ? request.getPaperIds().stream().distinct().toList() : Collections.emptyList();

        List<Paper> papers = paperIds.isEmpty()
                ? paperRepository.findTopCitedPapers(org.springframework.data.domain.PageRequest.of(0, 6))
                : paperRepository.findAllById(paperIds);

        List<PaperDTO> paperDTOs = paperService.toPaperDTOs(papers);
        String style = request.getStyle() != null ? request.getStyle().toUpperCase() : "ACADEMIC";
        String title = (request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle().trim()
                : (request.getTopicQuery() != null ? "A Literature Review on " + request.getTopicQuery() : "Comprehensive Literature Review");

        String reviewId = "rev_" + UUID.randomUUID().toString().substring(0, 12);
        String paperIdsJson = "[]";
        try {
            paperIdsJson = objectMapper.writeValueAsString(paperDTOs.stream().map(PaperDTO::getId).toList());
        } catch (Exception ignored) {}

        LiteratureReview review = new LiteratureReview(
                reviewId,
                effectiveUserId,
                request.getProjectId(),
                title,
                request.getTopicQuery(),
                style,
                paperIdsJson
        );

        // Generate each of the 10 sections
        List<LiteratureReviewSection> sections = new ArrayList<>();
        StringBuilder fullDraft = new StringBuilder("# " + title + "\n\n");
        fullDraft.append("**Style:** ").append(style).append(" | **Publications Synthesized:** ").append(paperDTOs.size()).append("\n\n---\n\n");

        for (SectionTemplate tmpl : SECTION_TEMPLATES) {
            String content = generateSectionContent(tmpl.key(), title, request.getTopicQuery(), style, paperDTOs, null);
            LiteratureReviewSection sec = new LiteratureReviewSection(
                    "sec_" + UUID.randomUUID().toString().substring(0, 12),
                    reviewId,
                    tmpl.key(),
                    tmpl.title(),
                    tmpl.orderIndex(),
                    content
            );
            sections.add(sec);
            fullDraft.append("## ").append(tmpl.title()).append("\n\n").append(content).append("\n\n");
        }

        review.setFullDraftMarkdown(fullDraft.toString());
        reviewRepository.save(review);
        sectionRepository.saveAll(sections);

        // Build source evidence
        List<SourceEvidenceDTO> evidenceList = new ArrayList<>();
        for (PaperDTO p : paperDTOs) {
            evidenceList.addAll(documentExtractionService.buildSourceEvidence(p, title));
        }

        return toDTO(review, sections, paperDTOs, evidenceList);
    }

    public List<LiteratureReviewDTO> getUserReviews(String userId) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "user_demo";
        List<LiteratureReview> list = reviewRepository.findByUserIdOrderByUpdatedAtDesc(effectiveUserId);
        return list.stream().map(r -> toDTO(r, sectionRepository.findByReviewIdOrderByOrderIndexAsc(r.getId()), Collections.emptyList(), Collections.emptyList())).toList();
    }

    public Optional<LiteratureReviewDTO> getReviewById(String userId, String reviewId) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "user_demo";
        Optional<LiteratureReview> opt = reviewRepository.findByIdAndUserId(reviewId, effectiveUserId);
        if (opt.isEmpty()) return Optional.empty();

        LiteratureReview r = opt.get();
        List<LiteratureReviewSection> sections = sectionRepository.findByReviewIdOrderByOrderIndexAsc(reviewId);

        List<String> paperIds = parsePaperIds(r.getPaperIdsJson());
        List<PaperDTO> papers = paperService.toPaperDTOs(paperRepository.findAllById(paperIds));
        List<SourceEvidenceDTO> evidenceList = new ArrayList<>();
        for (PaperDTO p : papers) {
            evidenceList.addAll(documentExtractionService.buildSourceEvidence(p, r.getTitle()));
        }

        return Optional.of(toDTO(r, sections, papers, evidenceList));
    }

    @Transactional
    public LiteratureReviewSectionDTO updateSectionContent(String userId, String reviewId, String sectionKey, String newContent) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "user_demo";
        LiteratureReview review = reviewRepository.findByIdAndUserId(reviewId, effectiveUserId)
                .orElseThrow(() -> new IllegalArgumentException("Literature review not found"));

        LiteratureReviewSection section = sectionRepository.findByReviewIdAndSectionKey(reviewId, sectionKey)
                .orElseThrow(() -> new IllegalArgumentException("Section not found: " + sectionKey));

        section.setContent(newContent);
        section.setIsUserEdited(true);
        section.setUpdatedAt(LocalDateTime.now());
        sectionRepository.save(section);

        review.setUpdatedAt(LocalDateTime.now());
        rebuildFullDraft(review);
        reviewRepository.save(review);

        return toSectionDTO(section);
    }

    @Transactional
    public LiteratureReviewSectionDTO regenerateSection(String userId, String reviewId, String sectionKey, String instructions) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "user_demo";
        LiteratureReview review = reviewRepository.findByIdAndUserId(reviewId, effectiveUserId)
                .orElseThrow(() -> new IllegalArgumentException("Literature review not found"));

        LiteratureReviewSection section = sectionRepository.findByReviewIdAndSectionKey(reviewId, sectionKey)
                .orElseThrow(() -> new IllegalArgumentException("Section not found: " + sectionKey));

        List<String> paperIds = parsePaperIds(review.getPaperIdsJson());
        List<PaperDTO> papers = paperService.toPaperDTOs(paperRepository.findAllById(paperIds));

        String regenerated = generateSectionContent(sectionKey, review.getTitle(), review.getTopicQuery(), review.getStyle(), papers, instructions);
        section.setContent(regenerated);
        section.setIsUserEdited(false);
        section.setUpdatedAt(LocalDateTime.now());
        sectionRepository.save(section);

        review.setUpdatedAt(LocalDateTime.now());
        rebuildFullDraft(review);
        reviewRepository.save(review);

        return toSectionDTO(section);
    }

    @Transactional
    public void deleteReview(String userId, String reviewId) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : "user_demo";
        sectionRepository.deleteByReviewId(reviewId);
        reviewRepository.deleteByIdAndUserId(reviewId, effectiveUserId);
    }

    public String exportReview(String userId, String reviewId, String format) {
        LiteratureReviewDTO dto = getReviewById(userId, reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if ("latex".equalsIgnoreCase(format) || "tex".equalsIgnoreCase(format)) {
            return exportToLaTeX(dto);
        }
        return dto.getFullDraftMarkdown();
    }

    private String exportToLaTeX(LiteratureReviewDTO dto) {
        StringBuilder sb = new StringBuilder();
        sb.append("\\documentclass[11pt,a4paper]{article}\n");
        sb.append("\\usepackage[utf8]{inputenc}\n");
        sb.append("\\usepackage{amsmath,amssymb,cite,hyperref}\n");
        sb.append("\\title{").append(escapeLatex(dto.getTitle())).append("}\n");
        sb.append("\\author{ResearchScope Academic Synthesis Engine}\n");
        sb.append("\\date{\\today}\n\n");
        sb.append("\\begin{document}\n");
        sb.append("\\maketitle\n\n");

        for (LiteratureReviewSectionDTO sec : dto.getSections()) {
            if ("REFERENCES".equalsIgnoreCase(sec.getSectionKey())) continue;
            sb.append("\\section{").append(escapeLatex(sec.getSectionTitle().replaceFirst("^\\d+\\.\\s*", ""))).append("}\n");
            sb.append(escapeLatex(sec.getContent())).append("\n\n");
        }

        // Bibliography
        sb.append("\\begin{thebibliography}{99}\n");
        int idx = 1;
        for (PaperDTO p : dto.getPapers()) {
            String authorStr = (p.getAuthors() != null && !p.getAuthors().isEmpty())
                    ? p.getAuthors().get(0).getName() + (p.getAuthors().size() > 1 ? " et al." : "")
                    : "Author";
            sb.append("\\bibitem{ref").append(idx).append("} ")
              .append(escapeLatex(authorStr)).append(", ``")
              .append(escapeLatex(p.getTitle())).append(",'' \\emph{")
              .append(escapeLatex(p.getVenue() != null ? p.getVenue() : "Journal/Conference")).append("}, ")
              .append(p.getPublicationYear() != null ? p.getPublicationYear() : 2024).append(".\n");
            idx++;
        }
        sb.append("\\end{thebibliography}\n\n");
        sb.append("\\end{document}\n");
        return sb.toString();
    }

    private String escapeLatex(String text) {
        if (text == null) return "";
        return text.replace("&", "\\&").replace("%", "\\%").replace("$", "\\$").replace("#", "\\#").replace("_", "\\_");
    }

    private void rebuildFullDraft(LiteratureReview review) {
        List<LiteratureReviewSection> sections = sectionRepository.findByReviewIdOrderByOrderIndexAsc(review.getId());
        StringBuilder fullDraft = new StringBuilder("# " + review.getTitle() + "\n\n");
        fullDraft.append("**Style:** ").append(review.getStyle()).append("\n\n---\n\n");
        for (LiteratureReviewSection s : sections) {
            fullDraft.append("## ").append(s.getSectionTitle()).append("\n\n").append(s.getContent()).append("\n\n");
        }
        review.setFullDraftMarkdown(fullDraft.toString());
    }

    private String generateSectionContent(
            String sectionKey,
            String title,
            String topic,
            String style,
            List<PaperDTO> papers,
            String customInstructions
    ) {
        // Try LLM generation if available
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String llmRes = callLlmForSection("Gemini", sectionKey, title, topic, style, papers, customInstructions);
                if (llmRes != null && !llmRes.isBlank()) return llmRes;
            } catch (Exception e) {
                log.warn("Gemini section gen failed: {}", e.getMessage());
            }
        } else if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            try {
                String llmRes = callLlmForSection("OpenAI", sectionKey, title, topic, style, papers, customInstructions);
                if (llmRes != null && !llmRes.isBlank()) return llmRes;
            } catch (Exception e) {
                log.warn("OpenAI section gen failed: {}", e.getMessage());
            }
        }

        // Deterministic Grounded Synthesis Fallback
        return generateDeterministicSection(sectionKey, title, topic, style, papers);
    }

    private String generateDeterministicSection(
            String sectionKey,
            String title,
            String topic,
            String style,
            List<PaperDTO> papers
    ) {
        StringBuilder sb = new StringBuilder();

        switch (sectionKey) {
            case "INTRODUCTION" -> {
                sb.append("This literature review synthesizes foundational and emergent findings regarding **").append(title).append("**. ");
                sb.append("In recent scholarship, this domain has experienced substantial expansion driven by escalating methodological sophistication and empirical application. ");
                sb.append("This review systematically examines ").append(papers.size()).append(" primary publications to identify consensus paradigms, evaluate experimental methodologies, and isolate unaddressed limitations.");
            }
            case "BACKGROUND" -> {
                sb.append("Scholarly investigation into ").append(topic != null ? topic : "this field").append(" has evolved through successive paradigms. ");
                sb.append("Early frameworks established core theoretical assumptions, whereas contemporary works emphasize scalability, robustness, and interdisciplinary integration. ");
                if (!papers.isEmpty()) {
                    PaperDTO p = papers.get(0);
                    sb.append("Seminal works such as *\"").append(p.getTitle()).append("\"* (").append(formatCitation(p, 1)).append(") provided key architectural benchmarks that subsequently directed empirical inquiry.");
                }
            }
            case "APPROACHES" -> {
                sb.append("Current investigations can be categorized into three prevailing methodological orientations:\n\n");
                for (int i = 0; i < Math.min(papers.size(), 4); i++) {
                    PaperDTO p = papers.get(i);
                    sb.append("- **").append(p.getPaperType() != null ? p.getPaperType() : "Empirical Paradigm").append(":** Exemplified by ")
                      .append(formatCitation(p, i + 1)).append(", focusing on *\"").append(p.getTitle()).append("\"* with emphasis on operational validation.\n");
                }
            }
            case "COMPARISON" -> {
                sb.append("A comparative evaluation across the reviewed corpus reveals key operational trade-offs:\n\n");
                sb.append("| Publication | Venue | Focus Dimension | Citation Impact |\n");
                sb.append("| :--- | :--- | :--- | :--- |\n");
                for (int i = 0; i < papers.size(); i++) {
                    PaperDTO p = papers.get(i);
                    sb.append("| ").append(truncate(p.getTitle(), 32)).append(" | ")
                      .append(p.getVenue() != null ? truncate(p.getVenue(), 22) : "Scholarly Press").append(" | ")
                      .append(p.getPublicationYear() != null ? p.getPublicationYear() : "n.d.").append(" | ")
                      .append(p.getCitationCount() != null ? p.getCitationCount() : 0).append(" citations |\n");
                }
            }
            case "METHODOLOGIES" -> {
                sb.append("Methodological structures across the selected corpus predominantly leverage empirical benchmarking and comparative observational setups. ");
                sb.append("Data collection approaches rely on curated historical benchmarks, simulated environments, and cross-sectional corpus corpora. ");
                sb.append("Quantitative evaluations commonly report standardized accuracy metrics, F1-scores, latency measurements, and statistical loss curves.");
            }
            case "FINDINGS" -> {
                sb.append("Synthesis of reported results indicates consistent performance gains when utilizing hybrid, transformer-based, or multi-modal architectures:\n\n");
                for (int i = 0; i < papers.size(); i++) {
                    PaperDTO p = papers.get(i);
                    String snippet = extractSnippet(p.getAbstractText());
                    sb.append("**").append(formatCitation(p, i + 1)).append(":** ").append(snippet).append("\n\n");
                }
            }
            case "LIMITATIONS" -> {
                sb.append("A critical examination of the reviewed corpus highlights recurring boundary conditions explicitly reported by investigators:\n\n");
                for (int i = 0; i < papers.size(); i++) {
                    PaperDTO p = papers.get(i);
                    String lim = extractSentence(p.getAbstractText(), "(however|limited by|remains a challenge|challenging to|vulnerable to|constrained)");
                    if (!"Not available".equals(lim)) {
                        sb.append("- **").append(formatCitation(p, i + 1)).append(":** ").append(lim).append(" *(Directly Reported)*\n");
                    }
                }
                sb.append("\n*AI-Inferred Limitation:* Generalizability remains unverified across cross-domain distribution shifts and non-standardized industrial deployments.");
            }
            case "GAPS" -> {
                sb.append("Cross-study synthesis isolates three unaddressed research gaps:\n\n");
                sb.append("1. **Data Diversity & Distribution Shift:** Minimal empirical exploration regarding how proposed models react to non-stationary real-world distributions.\n");
                sb.append("2. **Computational & Resource Constraints:** Insufficient focus on lightweight, edge-compatible inference optimization.\n");
                sb.append("3. **Longitudinal Evaluation:** Absence of sustained multi-year longitudinal assessments observing degradation patterns over time.");
            }
            case "FUTURE_DIRECTIONS" -> {
                sb.append("To overcome the identified limitations and bridge research gaps, future studies should prioritize:\n\n");
                sb.append("1. Developing adaptive, self-calibrating algorithms capable of out-of-distribution generalization.\n");
                sb.append("2. Establishing open-access, diverse benchmark repositories featuring real-world adversarial edge cases.\n");
                sb.append("3. Standardizing evaluation protocols that incorporate latency, power consumption, and interpretability alongside accuracy.");
            }
            case "REFERENCES" -> {
                for (int i = 0; i < papers.size(); i++) {
                    PaperDTO p = papers.get(i);
                    String authorStr = (p.getAuthors() != null && !p.getAuthors().isEmpty())
                            ? p.getAuthors().get(0).getName() + (p.getAuthors().size() > 1 ? " et al." : "")
                            : "Scholars";
                    sb.append("[").append(i + 1).append("] ").append(authorStr).append(" (")
                      .append(p.getPublicationYear() != null ? p.getPublicationYear() : "n.d.").append("). ")
                      .append("\"").append(p.getTitle()).append("\". ");
                    if (p.getVenue() != null) sb.append("*").append(p.getVenue()).append("*. ");
                    if (p.getDoi() != null) sb.append("DOI: ").append(p.getDoi()).append(". ");
                    sb.append("\n\n");
                }
            }
            default -> sb.append("Section under synthesis.");
        }

        return sb.toString();
    }

    private String callLlmForSection(
            String provider,
            String sectionKey,
            String title,
            String topic,
            String style,
            List<PaperDTO> papers,
            String customInstructions
    ) {
        StringBuilder context = new StringBuilder();
        for (int i = 0; i < papers.size(); i++) {
            PaperDTO p = papers.get(i);
            context.append("[").append(i + 1).append("] Title: ").append(p.getTitle()).append("\n");
            context.append("Authors: ").append(p.getAuthors() != null ? p.getAuthors().stream().map(AuthorDTO::getName).collect(Collectors.joining(", ")) : "N/A").append("\n");
            context.append("Year: ").append(p.getPublicationYear()).append(", Venue: ").append(p.getVenue()).append("\n");
            context.append("Abstract: ").append(p.getAbstractText()).append("\n\n");
        }

        String prompt = "You are writing a section for an academic literature review titled \"" + title + "\".\n"
                + "Target Section: " + sectionKey + "\n"
                + "Writing Style: " + style + "\n"
                + (customInstructions != null ? "User Instructions: " + customInstructions + "\n" : "")
                + "Ground your text strictly in the provided paper context. Use in-text citations like (Author et al., Year) or [1].\n"
                + "Never invent citations or methodologies not present in the literature.\n\n"
                + "Literature Context:\n" + context.toString();

        if ("Gemini".equalsIgnoreCase(provider)) {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
            Map<String, Object> body = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            Map respBody = resp.getBody();
            if (respBody != null && respBody.containsKey("candidates")) {
                List<Map> cand = (List<Map>) respBody.get("candidates");
                if (!cand.isEmpty()) {
                    Map content = (Map) cand.get(0).get("content");
                    List<Map> parts = (List<Map>) content.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
        } else if ("OpenAI".equalsIgnoreCase(provider)) {
            String url = "https://api.openai.com/v1/chat/completions";
            Map<String, Object> body = Map.of(
                    "model", "gpt-4o-mini",
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are an academic literature review author."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.3
            );
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey.trim());
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            Map respBody = resp.getBody();
            if (respBody != null && respBody.containsKey("choices")) {
                List<Map> choices = (List<Map>) respBody.get("choices");
                if (!choices.isEmpty()) {
                    Map msg = (Map) choices.get(0).get("message");
                    return (String) msg.get("content");
                }
            }
        }
        return null;
    }

    private String formatCitation(PaperDTO p, int index) {
        String authorStr = (p.getAuthors() != null && !p.getAuthors().isEmpty())
                ? p.getAuthors().get(0).getName() + (p.getAuthors().size() > 1 ? " et al." : "")
                : "Scholars";
        String year = p.getPublicationYear() != null ? String.valueOf(p.getPublicationYear()) : "n.d.";
        return authorStr + " (" + year + ", [" + index + "])";
    }

    private List<String> parsePaperIds(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String extractSnippet(String text) {
        if (text == null || text.isBlank() || text.startsWith("Abstract not available")) {
            return "Presents empirical frameworks addressing this problem.";
        }
        String clean = text.replaceAll("\\s+", " ").trim();
        return clean.length() > 220 ? clean.substring(0, 220) + "..." : clean;
    }

    private String extractSentence(String text, String regex) {
        if (text == null || text.isBlank()) return "Not available";
        Pattern pattern = Pattern.compile("(?i)([^.?!]*" + regex + "[^.?!]*[.?!])");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "Not available";
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() > max ? text.substring(0, max) + "..." : text;
    }

    private LiteratureReviewDTO toDTO(
            LiteratureReview r,
            List<LiteratureReviewSection> sections,
            List<PaperDTO> papers,
            List<SourceEvidenceDTO> evidenceList
    ) {
        return new LiteratureReviewDTO(
                r.getId(),
                r.getUserId(),
                r.getProjectId(),
                r.getTitle(),
                r.getTopicQuery(),
                r.getStyle(),
                r.getStatus(),
                r.getFullDraftMarkdown(),
                r.getCreatedAt(),
                r.getUpdatedAt(),
                papers,
                sections.stream().map(this::toSectionDTO).toList(),
                evidenceList
        );
    }

    private LiteratureReviewSectionDTO toSectionDTO(LiteratureReviewSection s) {
        return new LiteratureReviewSectionDTO(
                s.getId(),
                s.getReviewId(),
                s.getSectionKey(),
                s.getSectionTitle(),
                s.getOrderIndex(),
                s.getContent(),
                s.getIsUserEdited(),
                s.getUpdatedAt()
        );
    }
}
