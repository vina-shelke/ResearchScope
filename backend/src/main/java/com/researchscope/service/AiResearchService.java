package com.researchscope.service;

import com.researchscope.dto.AiAnswerResponse;
import com.researchscope.dto.AiQuestionRequest;
import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.entity.Paper;
import com.researchscope.repository.PaperRepository;
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
import java.util.stream.Collectors;

@Service
public class AiResearchService {

    private static final Logger log = LoggerFactory.getLogger(AiResearchService.class);

    private final PaperRepository paperRepository;
    private final PaperService paperService;
    private final RestTemplate restTemplate;

    @Value("${ai.assistant.gemini-api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    @Value("${ai.assistant.openai-api-key:${OPENAI_API_KEY:}}")
    private String openaiApiKey;

    public AiResearchService(PaperRepository paperRepository, PaperService paperService) {
        this.paperRepository = paperRepository;
        this.paperService = paperService;
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(20000);
        this.restTemplate = new RestTemplate(factory);
    }

    public AiAnswerResponse answerResearchQuestion(AiQuestionRequest request) {
        String question = request.getQuestion();
        if (question == null || question.isBlank()) {
            return new AiAnswerResponse("", "Please provide a valid research question.", "None", Collections.emptyList());
        }

        int maxSources = request.getMaxSources() != null && request.getMaxSources() > 0 ? Math.min(request.getMaxSources(), 10) : 5;

        // 1. Retrieve Candidate Evidence Papers from Database
        List<Paper> candidatePapers = retrieveRelevantPapers(question, request.getTopic(), maxSources);
        List<PaperDTO> citedPapers = paperService.toPaperDTOs(candidatePapers);

        if (citedPapers.isEmpty()) {
            String fallback = "No relevant scholarly papers were found in the database to answer: \"" + question + "\".\n\n"
                    + "💡 **Tip:** Try using the Search bar to ingest papers on this topic first, or rephrase your question using common academic keywords.";
            return new AiAnswerResponse(question, fallback, "Corpus Retrieval", Collections.emptyList());
        }

        // 2. Try LLM synthesis if API key is provided
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String llmAnswer = callGeminiApi(question, citedPapers);
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    return new AiAnswerResponse(question, llmAnswer, "LLM (Google Gemini)", citedPapers);
                }
            } catch (Exception e) {
                log.warn("Gemini LLM call failed, falling back to local synthesis: {}", e.getMessage());
            }
        } else if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            try {
                String llmAnswer = callOpenAiApi(question, citedPapers);
                if (llmAnswer != null && !llmAnswer.isBlank()) {
                    return new AiAnswerResponse(question, llmAnswer, "LLM (OpenAI)", citedPapers);
                }
            } catch (Exception e) {
                log.warn("OpenAI LLM call failed, falling back to local synthesis: {}", e.getMessage());
            }
        }

        // 3. Fallback: Rigorous Grounded Evidence Synthesis
        String localSynthesis = generateGroundedSynthesis(question, citedPapers);
        return new AiAnswerResponse(question, localSynthesis, "Grounded Corpus Evidence Synthesis", citedPapers);
    }

    private List<Paper> retrieveRelevantPapers(String question, String topic, int limit) {
        // Extract keywords from question
        String cleanQuery = question.replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\b(what|is|are|the|how|does|do|in|of|and|for|to|on|with|by|a|an|summarize|explain)\\b", "")
                .replaceAll("\\s+", " ").trim();

        String effectiveSearch = (topic != null && !topic.isBlank()) ? topic.trim() : cleanQuery;
        if (effectiveSearch.isBlank()) {
            effectiveSearch = question.trim();
        }

        // Search in repository
        Page<Paper> results = paperRepository.searchPapersExtended(
                effectiveSearch, null, null, null, null, null, null, null, PageRequest.of(0, limit)
        );

        if (results.isEmpty() && topic != null && !topic.isBlank()) {
            results = paperRepository.searchPapersExtended(topic.trim(), null, null, null, null, null, null, null, PageRequest.of(0, limit));
        }

        if (results.isEmpty()) {
            // Fall back to top cited papers
            return paperRepository.findTopCitedPapers(PageRequest.of(0, limit));
        }

        return results.getContent();
    }

    public String generateGroundedSynthesis(String question, List<PaperDTO> papers) {
        StringBuilder sb = new StringBuilder();

        sb.append("### Executive Summary\n\n");
        sb.append("Based on ").append(papers.size()).append(" scholarly publications retrieved from the ResearchScope database, ");
        sb.append("investigations regarding **\"").append(question).append("\"** reveal interconnected findings across multiple research dimensions.\n\n");

        sb.append("### Key Findings & Evidence Synthesis\n\n");
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

        sb.append("### Methodologies & Academic Context\n\n");
        long totalCites = papers.stream().mapToLong(p -> p.getCitationCount() != null ? p.getCitationCount() : 0).sum();
        long oaCount = papers.stream().filter(p -> Boolean.TRUE.equals(p.getIsOpenAccess())).count();
        Set<String> venues = papers.stream().map(PaperDTO::getVenue).filter(v -> v != null && !v.isBlank()).collect(Collectors.toSet());

        sb.append("- **Cumulative Citations:** ").append(totalCites).append(" citations across these ").append(papers.size()).append(" works.\n");
        sb.append("- **Open Access Accessibility:** ").append(oaCount).append(" out of ").append(papers.size()).append(" publications provide direct open-access full-text access.\n");
        if (!venues.isEmpty()) {
            sb.append("- **Key Venues & Conferences:** ").append(String.join(", ", venues.stream().limit(4).toList())).append(".\n");
        }

        sb.append("\n### Research Implications & Future Directions\n\n");
        sb.append("The evidence emphasizes the necessity of continual empirical validation, standardized benchmarks, ");
        sb.append("and interdisciplinary collaboration to address current limitations identified in these studies. ");
        sb.append("Review the individual references below for detailed methodology and dataset specifications.\n");

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

    private String callGeminiApi(String question, List<PaperDTO> papers) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        StringBuilder context = new StringBuilder();
        for (int i = 0; i < papers.size(); i++) {
            PaperDTO p = papers.get(i);
            context.append("[").append(i + 1).append("] Title: ").append(p.getTitle()).append("\n");
            context.append("Year: ").append(p.getPublicationYear()).append(", Venue: ").append(p.getVenue()).append("\n");
            context.append("Abstract: ").append(p.getAbstractText()).append("\n\n");
        }

        String prompt = "You are ResearchScope AI, an academic research intelligence assistant.\n"
                + "Answer the following question using ONLY the provided scholarly literature context.\n"
                + "Always cite papers using [1], [2], etc., corresponding to the sources.\n\n"
                + "Question: " + question + "\n\n"
                + "Literature Context:\n" + context.toString();

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

    private String callOpenAiApi(String question, List<PaperDTO> papers) {
        String url = "https://api.openai.com/v1/chat/completions";

        StringBuilder context = new StringBuilder();
        for (int i = 0; i < papers.size(); i++) {
            PaperDTO p = papers.get(i);
            context.append("[").append(i + 1).append("] Title: ").append(p.getTitle()).append("\n");
            context.append("Year: ").append(p.getPublicationYear()).append(", Venue: ").append(p.getVenue()).append("\n");
            context.append("Abstract: ").append(p.getAbstractText()).append("\n\n");
        }

        String systemPrompt = "You are ResearchScope AI, an academic research intelligence assistant. Answer research questions using ONLY the provided scholarly literature. Cite papers using [1], [2], etc. strictly matching the context.";
        String userPrompt = "Question: " + question + "\n\nLiterature Context:\n" + context.toString();

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.3
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
}
