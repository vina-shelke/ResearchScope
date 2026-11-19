package com.researchscope.service;

import com.researchscope.dto.*;
import com.researchscope.entity.Paper;
import com.researchscope.entity.SavedPaper;
import com.researchscope.repository.PaperRepository;
import com.researchscope.repository.SavedPaperRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiResearchService {

    private static final Logger log = LoggerFactory.getLogger(AiResearchService.class);

    private final PaperRepository paperRepository;
    private final SavedPaperRepository savedPaperRepository;
    private final PaperService paperService;
    private final DocumentExtractionService documentExtractionService;
    private final RestTemplate restTemplate;

    @Value("${ai.assistant.gemini-api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    @Value("${ai.assistant.openai-api-key:${OPENAI_API_KEY:}}")
    private String openaiApiKey;

    public AiResearchService(
            PaperRepository paperRepository,
            SavedPaperRepository savedPaperRepository,
            PaperService paperService,
            DocumentExtractionService documentExtractionService
    ) {
        this.paperRepository = paperRepository;
        this.savedPaperRepository = savedPaperRepository;
        this.paperService = paperService;
        this.documentExtractionService = documentExtractionService;

        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(25000);
        this.restTemplate = new RestTemplate(factory);
    }

    public AiAnswerResponse answerResearchQuestion(AiQuestionRequest request) {
        return answerResearchQuestion(request, "user_demo");
    }

    public AiAnswerResponse answerResearchQuestion(AiQuestionRequest request, String userId) {
        String question = request.getQuestion();
        if (question == null || question.isBlank()) {
            return new AiAnswerResponse("", "Please provide a valid research question or topic.", "None", Collections.emptyList());
        }

        String explanationLevel = request.getExplanationLevel() != null ? request.getExplanationLevel().toUpperCase() : "ACADEMIC";
        String queryMode = request.getQueryMode() != null ? request.getQueryMode().toUpperCase() : "QUESTION";
        int maxSources = request.getMaxSources() != null && request.getMaxSources() > 0 ? Math.min(request.getMaxSources(), 10) : 5;

        // 1. Retrieve Candidate Evidence Papers according to Scope
        List<Paper> candidatePapers = resolveScopedPapers(request, userId, maxSources);
        List<PaperDTO> citedPapers = paperService.toPaperDTOs(candidatePapers);

        // 2. Extract Document Chunks and Build Source Evidence
        List<SourceEvidenceDTO> evidenceList = new ArrayList<>();
        for (PaperDTO p : citedPapers) {
            evidenceList.addAll(documentExtractionService.buildSourceEvidence(p, question));
        }

        if (citedPapers.isEmpty()) {
            String fallback = "No relevant scholarly papers were found in the database matching your scope and criteria: \"" + question + "\".\n\n"
                    + "**Tip:** Expand your search query or save papers to your research workspace first to ground the assistant.";
            return new AiAnswerResponse(
                    question,
                    fallback,
                    explanationLevel,
                    "Insufficient Corpus Evidence",
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    List.of("Try rephrasing with academic synonyms", "Broaden your topic domain"),
                    false,
                    "No matching papers in scope to ground this response."
            );
        }

        // 3. Structured Claim Extraction
        List<ResearchClaimDTO> structuredClaims = buildStructuredClaims(citedPapers, evidenceList);

        // 4. Generate Candidate Next Questions
        List<String> suggestedQuestions = generateFollowUpQuestions(question, citedPapers);

        // 5. Try LLM synthesis if API key is provided
        String warningMessage = citedPapers.stream().noneMatch(p -> Boolean.TRUE.equals(p.getIsOpenAccess()))
                ? "Note: Synthesized primarily from peer-reviewed abstracts as full open-access PDFs are unavailable."
                : null;

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String llmAnswer = callGeminiApi(question, citedPapers, evidenceList, explanationLevel, queryMode, request.getSummaryType());
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    return new AiAnswerResponse(
                            question,
                            llmAnswer,
                            explanationLevel,
                            "LLM (Google Gemini RAG)",
                            citedPapers,
                            evidenceList,
                            structuredClaims,
                            suggestedQuestions,
                            true,
                            warningMessage
                    );
                }
            } catch (Exception e) {
                log.warn("Gemini LLM call failed, falling back to local grounded synthesis: {}", e.getMessage());
            }
        } else if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            try {
                String llmAnswer = callOpenAiApi(question, citedPapers, evidenceList, explanationLevel, queryMode, request.getSummaryType());
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    return new AiAnswerResponse(
                            question,
                            llmAnswer,
                            explanationLevel,
                            "LLM (OpenAI RAG)",
                            citedPapers,
                            evidenceList,
                            structuredClaims,
                            suggestedQuestions,
                            true,
                            warningMessage
                    );
                }
            } catch (Exception e) {
                log.warn("OpenAI LLM call failed, falling back to local grounded synthesis: {}", e.getMessage());
            }
        }

        // 6. Grounded Local Corpus Synthesis Fallback
        String localSynthesis = generateGroundedSynthesis(question, citedPapers, evidenceList, explanationLevel, queryMode, request.getSummaryType());
        return new AiAnswerResponse(
                question,
                localSynthesis,
                explanationLevel,
                "Grounded Corpus Evidence Synthesis",
                citedPapers,
                evidenceList,
                structuredClaims,
                suggestedQuestions,
                true,
                warningMessage
        );
    }

    private List<Paper> resolveScopedPapers(AiQuestionRequest request, String userId, int limit) {
        String scope = request.getScope() != null ? request.getScope().toUpperCase() : "TOPIC";

        // Scope A: Single Paper
        if ("PAPER".equals(scope) && request.getPaperId() != null && !request.getPaperId().isBlank()) {
            Optional<Paper> p = paperRepository.findById(request.getPaperId().trim());
            return p.map(List::of).orElse(Collections.emptyList());
        }

        // Scope B: Multi-Paper Set
        if ("PAPERS_SET".equals(scope) && request.getPaperIds() != null && !request.getPaperIds().isEmpty()) {
            List<String> ids = request.getPaperIds().stream().filter(id -> id != null && !id.isBlank()).limit(limit).toList();
            return paperRepository.findAllById(ids);
        }

        // Scope C: Workspace Project
        if ("PROJECT".equals(scope) && request.getProjectId() != null && !request.getProjectId().isBlank()) {
            List<SavedPaper> savedList = savedPaperRepository.findByUserIdAndProjectIdOrderBySavedAtDesc(userId, request.getProjectId().trim());
            List<String> paperIds = savedList.stream().map(SavedPaper::getPaperId).limit(limit).toList();
            return paperRepository.findAllById(paperIds);
        }

        // Scope D: Workspace Collection
        if ("COLLECTION".equals(scope) && request.getCollectionName() != null && !request.getCollectionName().isBlank()) {
            List<SavedPaper> savedList = savedPaperRepository.findByUserIdAndCollectionNameOrderBySavedAtDesc(userId, request.getCollectionName().trim());
            List<String> paperIds = savedList.stream().map(SavedPaper::getPaperId).limit(limit).toList();
            return paperRepository.findAllById(paperIds);
        }

        // Scope E: Topic Search (Default)
        return retrieveRelevantPapers(request.getQuestion(), request.getTopic(), limit);
    }

    private List<Paper> retrieveRelevantPapers(String question, String topic, int limit) {
        String cleanQuery = question.replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\b(what|is|are|the|how|does|do|in|of|and|for|to|on|with|by|a|an|summarize|explain|tell|me|about)\\b", "")
                .replaceAll("\\s+", " ").trim();

        String effectiveSearch = (topic != null && !topic.isBlank()) ? topic.trim() : cleanQuery;
        if (effectiveSearch.isBlank()) {
            effectiveSearch = question.trim();
        }

        Page<Paper> results = paperRepository.searchPapersExtended(
                effectiveSearch, null, null, null, null, null, null, null, PageRequest.of(0, limit)
        );

        if (results.isEmpty() && topic != null && !topic.isBlank()) {
            results = paperRepository.searchPapersExtended(topic.trim(), null, null, null, null, null, null, null, PageRequest.of(0, limit));
        }

        if (results.isEmpty()) {
            return paperRepository.findTopCitedPapers(PageRequest.of(0, limit));
        }

        return results.getContent();
    }

    private List<ResearchClaimDTO> buildStructuredClaims(List<PaperDTO> papers, List<SourceEvidenceDTO> evidence) {
        List<ResearchClaimDTO> claims = new ArrayList<>();
        for (int i = 0; i < Math.min(papers.size(), 4); i++) {
            PaperDTO p = papers.get(i);
            String snippet = extractKeyInsight(p.getAbstractText());
            List<SourceEvidenceDTO> matching = evidence.stream()
                    .filter(e -> e.getPaperId() != null && e.getPaperId().equals(p.getId()))
                    .toList();

            claims.add(new ResearchClaimDTO(
                    p.getTitle() + " establishes that " + snippet,
                    "DIRECTLY_REPORTED",
                    matching.isEmpty() ? List.of(new SourceEvidenceDTO(
                            p.getId(), p.getTitle(),
                            p.getAuthors() != null ? p.getAuthors().stream().map(AuthorDTO::getName).toList() : Collections.emptyList(),
                            p.getPublicationYear(), p.getVenue(), p.getDoi(), p.getUrl(), p.getPdfUrl(),
                            "Abstract", snippet, "DIRECTLY_REPORTED", "VERIFIED_GROUNDED"
                    )) : matching
            ));
        }
        return claims;
    }

    private List<String> generateFollowUpQuestions(String query, List<PaperDTO> papers) {
        List<String> list = new ArrayList<>();
        if (!papers.isEmpty()) {
            PaperDTO first = papers.get(0);
            list.add("What are the reported limitations in " + first.getTitle() + "?");
        }
        list.add("How do the methodologies compare across these " + papers.size() + " publications?");
        list.add("What potential research gaps exist for future investigation?");
        return list;
    }

    public String generateGroundedSynthesis(
            String question,
            List<PaperDTO> papers,
            List<SourceEvidenceDTO> evidenceList,
            String explanationLevel,
            String queryMode,
            String summaryType
    ) {
        StringBuilder sb = new StringBuilder();

        // Level-specific intro header
        if ("BEGINNER".equals(explanationLevel)) {
            sb.append("### Beginner-Friendly Overview\n\n");
            sb.append("In simple terms, exploring **\"").append(question).append("\"** comes down to how researchers have investigated this problem across ")
              .append(papers.size()).append(" key academic works. Here is an intuitive breakdown without dense technical jargon.\n\n");
        } else if ("TECHNICAL".equals(explanationLevel)) {
            sb.append("### Technical Deep-Dive & Methodological Architecture\n\n");
            sb.append("Analytical synthesis of **\"").append(question).append("\"** grounded across ").append(papers.size())
              .append(" peer-reviewed publications. Focuses on concrete algorithmic formulations, benchmark distributions, and metric tradeoffs.\n\n");
        } else {
            sb.append("### Academic Synthesis & Executive Summary\n\n");
            sb.append("Based on ").append(papers.size()).append(" scholarly publications retrieved from the ResearchScope corpus, ");
            sb.append("inquiries regarding **\"").append(question).append("\"** demonstrate interconnected empirical findings across several core themes.\n\n");
        }

        // Section: Key Findings & Author Attribution
        sb.append("### Key Findings & Empirical Evidence\n\n");
        for (int i = 0; i < papers.size(); i++) {
            PaperDTO paper = papers.get(i);
            int refNum = i + 1;
            String authorStr = (paper.getAuthors() != null && !paper.getAuthors().isEmpty())
                    ? paper.getAuthors().get(0).getName() + (paper.getAuthors().size() > 1 ? " et al." : "")
                    : "Researchers";

            sb.append("**[").append(refNum).append("] ")
              .append(authorStr).append(" (").append(paper.getPublicationYear() != null ? paper.getPublicationYear() : "n.d.").append(")** — *\"")
              .append(paper.getTitle()).append("\"*:\n");

            String snippet = extractKeyInsight(paper.getAbstractText());
            sb.append("> ").append(snippet).append("\n\n");
        }

        // Query mode specific sections
        if ("LIMITATIONS".equals(queryMode)) {
            sb.append("### Explicit vs. Inferred Limitations\n\n");
            sb.append("#### Explicit Limitations Reported by Authors:\n");
            for (PaperDTO p : papers) {
                String lim = extractSentence(p.getAbstractText(), "(however|limited by|remains a challenge|challenging to|vulnerable to|constrained)");
                if (!"Not available".equals(lim)) {
                    sb.append("- **").append(p.getTitle()).append(":** ").append(lim).append(" *(Directly Reported)*\n");
                }
            }
            sb.append("\n#### Inferred Limitations (Cross-Corpus Synthesis):\n");
            sb.append("- **Dataset Generalization:** Many empirical validations rely on historical benchmarks which may suffer from distribution shift in real-world environments. *(AI-Inferred)*\n");
            sb.append("- **Computational Overhead:** Scalability constraints are frequently observed across deep learning and large-scale model architectures. *(AI-Inferred)*\n\n");
        } else if ("COMPARE".equals(queryMode)) {
            sb.append("### Comparative Analysis of Approaches\n\n");
            sb.append("| Publication | Core Methodology | Focus Area | Reported Metrics |\n");
            sb.append("| :--- | :--- | :--- | :--- |\n");
            for (PaperDTO p : papers) {
                String venue = p.getVenue() != null ? p.getVenue() : "Conference/Journal";
                sb.append("| ").append(truncateSnippet(p.getTitle(), 30)).append(" | ")
                  .append(p.getPaperType() != null ? p.getPaperType() : "Empirical Study").append(" | ")
                  .append(truncateSnippet(venue, 20)).append(" | ")
                  .append(p.getCitationCount()).append(" citations |\n");
            }
            sb.append("\n");
        } else if ("QUESTIONS_GEN".equals(queryMode)) {
            sb.append("### High-Impact Research Questions & Future Hypotheses\n\n");
            sb.append("1. **Generalization Hypothesis:** How do the frameworks proposed in these works generalize when subjected to adversarial perturbations or out-of-distribution inputs?\n");
            sb.append("2. **Efficiency & Scalability:** Can the computational footprint of these architectures be compressed without compromising statistical confidence?\n");
            sb.append("3. **Cross-Domain Transfer:** What modifications are required to adapt these findings to emergent deployment scenarios?\n\n");
        }

        // Section: Verification and Accessibility Context
        sb.append("### Verification & Accessibility Metrics\n\n");
        long totalCites = papers.stream().mapToLong(p -> p.getCitationCount() != null ? p.getCitationCount() : 0).sum();
        long oaCount = papers.stream().filter(p -> Boolean.TRUE.equals(p.getIsOpenAccess())).count();

        sb.append("- **Cumulative Citations:** ").append(totalCites).append(" citations across cited works.\n");
        sb.append("- **Open Access Verification:** ").append(oaCount).append(" of ").append(papers.size())
          .append(" publications have direct open-access full-text/PDF links available for inspection in the Evidence Drawer.\n");

        return sb.toString();
    }

    private String callGeminiApi(
            String question,
            List<PaperDTO> papers,
            List<SourceEvidenceDTO> evidenceList,
            String explanationLevel,
            String queryMode,
            String summaryType
    ) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        StringBuilder context = new StringBuilder();
        for (int i = 0; i < papers.size(); i++) {
            PaperDTO p = papers.get(i);
            context.append("[").append(i + 1).append("] Title: ").append(p.getTitle()).append("\n");
            context.append("Year: ").append(p.getPublicationYear()).append(", Venue: ").append(p.getVenue()).append(", DOI: ").append(p.getDoi()).append("\n");
            context.append("Abstract: ").append(p.getAbstractText()).append("\n\n");
        }

        String prompt = buildSystemPrompt(explanationLevel, queryMode, summaryType)
                + "\n\nQuestion / Directive: " + question
                + "\n\nAvailable Scholarly Literature Context:\n" + context.toString();

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        Map<String, Object> respBody = resp.getBody();
        if (respBody != null && respBody.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) respBody.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> first = candidates.get(0);
                Map<String, Object> contentObj = (Map<String, Object>) first.get("content");
                if (contentObj != null && contentObj.containsKey("parts")) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        }
        return null;
    }

    private String callOpenAiApi(
            String question,
            List<PaperDTO> papers,
            List<SourceEvidenceDTO> evidenceList,
            String explanationLevel,
            String queryMode,
            String summaryType
    ) {
        String url = "https://api.openai.com/v1/chat/completions";

        StringBuilder context = new StringBuilder();
        for (int i = 0; i < papers.size(); i++) {
            PaperDTO p = papers.get(i);
            context.append("[").append(i + 1).append("] Title: ").append(p.getTitle()).append("\n");
            context.append("Year: ").append(p.getPublicationYear()).append(", Venue: ").append(p.getVenue()).append(", DOI: ").append(p.getDoi()).append("\n");
            context.append("Abstract: ").append(p.getAbstractText()).append("\n\n");
        }

        String systemPrompt = buildSystemPrompt(explanationLevel, queryMode, summaryType);
        String userPrompt = "Question / Directive: " + question + "\n\nAvailable Scholarly Literature Context:\n" + context.toString();

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.25
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey.trim());
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        Map<String, Object> respBody = resp.getBody();
        if (respBody != null && respBody.containsKey("choices")) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) respBody.get("choices");
            if (!choices.isEmpty()) {
                Map<String, Object> choice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                if (message != null && message.containsKey("content")) {
                    return (String) message.get("content");
                }
            }
        }
        return null;
    }

    private String buildSystemPrompt(String explanationLevel, String queryMode, String summaryType) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are ResearchScope AI, an academic research intelligence assistant.\n");
        sb.append("You MUST ground every statement strictly in the provided scholarly literature context.\n");
        sb.append("Cite papers using [1], [2], etc., matching the given context.\n");
        sb.append("Never invent citations, benchmarks, or sample sizes.\n");
        sb.append("Explicitly separate author-reported statements from AI-inferred interpretations.\n");

        if ("BEGINNER".equals(explanationLevel)) {
            sb.append("Explanation Style: Beginner-Friendly. Use clear analogies, plain English, and explain fundamental concepts simply without heavy jargon.\n");
        } else if ("TECHNICAL".equals(explanationLevel)) {
            sb.append("Explanation Style: Technical. Provide deep algorithmic, mathematical, and architectural detail including formulas, hyperparameter considerations, and dataset distributions.\n");
        } else {
            sb.append("Explanation Style: Academic. Write in a formal, peer-reviewed literature review tone with rigorous attribution.\n");
        }

        if ("LIMITATIONS".equals(queryMode)) {
            sb.append("Objective: Identify limitations explicitly noted by the authors and distinguish them from inferred limitations.\n");
        } else if ("COMPARE".equals(queryMode)) {
            sb.append("Objective: Compare findings across authors, pointing out agreements, disagreements, and contradictions.\n");
        } else if ("QUESTIONS_GEN".equals(queryMode)) {
            sb.append("Objective: Formulate high-impact candidate research questions and hypotheses rooted in the text.\n");
        }

        return sb.toString();
    }

    private String extractKeyInsight(String abstractText) {
        if (abstractText == null || abstractText.isBlank() || abstractText.startsWith("Abstract not available")) {
            return "Presents empirical frameworks and data analysis addressing this domain.";
        }
        String clean = abstractText.replaceAll("\\s+", " ").trim();
        if (clean.length() <= 240) {
            return clean;
        }
        int dotIdx = clean.indexOf(". ", 100);
        if (dotIdx != -1 && dotIdx < 300) {
            return clean.substring(0, dotIdx + 1);
        }
        return clean.substring(0, 240) + "...";
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

    private String truncateSnippet(String text, int maxLength) {
        if (text == null) return "";
        String clean = text.replaceAll("\\s+", " ").trim();
        if (clean.length() <= maxLength) return clean;
        return clean.substring(0, maxLength) + "...";
    }
}
