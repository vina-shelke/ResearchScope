package com.researchscope.integration;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class SemanticScholarAdapter {

    private static final Logger log = LoggerFactory.getLogger(SemanticScholarAdapter.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${scholarly.semanticscholar.base-url:https://api.semanticscholar.org/graph/v1}")
    private String baseUrl;

    public List<PaperDTO> searchWorks(String query, int limit) {
        List<PaperDTO> results = new ArrayList<>();
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format("%s/paper/search?query=%s&limit=%d&fields=paperId,title,abstract,year,venue,citationCount,externalIds,authors,fieldsOfStudy,url,isOpenAccess,openAccessPdf,publicationTypes",
                    baseUrl, encodedQuery, Math.min(limit, 20));

            log.info("Fetching Semantic Scholar papers from: {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("data")) {
                return results;
            }

            List<Map<String, Object>> papers = (List<Map<String, Object>>) response.get("data");
            if (papers == null) return results;

            for (Map<String, Object> paperMap : papers) {
                PaperDTO paper = mapSemanticScholarToPaperDTO(paperMap);
                if (paper != null) {
                    results.add(paper);
                }
            }
        } catch (Exception e) {
            log.error("Error querying Semantic Scholar API: {}", e.getMessage(), e);
        }
        return results;
    }

    private PaperDTO mapSemanticScholarToPaperDTO(Map<String, Object> paperMap) {
        try {
            PaperDTO paper = new PaperDTO();
            paper.setSource("Semantic Scholar");

            String paperId = (String) paperMap.get("paperId");
            paper.setSourceId(paperId);

            String title = (String) paperMap.get("title");
            if (title == null || title.isBlank()) return null;
            paper.setTitle(title.trim());

            String abstractText = (String) paperMap.get("abstract");
            paper.setAbstractText(abstractText != null ? abstractText.trim() : "Abstract not available.");

            Object year = paperMap.get("year");
            if (year instanceof Number n) {
                paper.setPublicationYear(n.intValue());
            }

            paper.setVenue((String) paperMap.get("venue"));
            paper.setUrl((String) paperMap.get("url"));

            Object citationCount = paperMap.get("citationCount");
            if (citationCount instanceof Number n) {
                paper.setCitationCount(n.intValue());
            }

            // Open Access & PDF
            Boolean isOa = (Boolean) paperMap.get("isOpenAccess");
            paper.setIsOpenAccess(Boolean.TRUE.equals(isOa));

            Map<String, Object> oaPdf = (Map<String, Object>) paperMap.get("openAccessPdf");
            if (oaPdf != null && oaPdf.containsKey("url")) {
                paper.setPdfUrl((String) oaPdf.get("url"));
                paper.setIsOpenAccess(true);
            }

            // Publication Types
            List<String> pubTypes = (List<String>) paperMap.get("publicationTypes");
            if (pubTypes != null && !pubTypes.isEmpty()) {
                paper.setPaperType(String.join(", ", pubTypes));
            }

            // External IDs (DOI)
            Map<String, Object> externalIds = (Map<String, Object>) paperMap.get("externalIds");
            if (externalIds != null && externalIds.containsKey("DOI")) {
                paper.setDoi((String) externalIds.get("DOI"));
            }

            // Authors
            List<Map<String, Object>> authors = (List<Map<String, Object>>) paperMap.get("authors");
            if (authors != null) {
                for (Map<String, Object> author : authors) {
                    String name = (String) author.get("name");
                    if (name != null && !name.isBlank()) {
                        AuthorDTO authorDTO = new AuthorDTO();
                        authorDTO.setId(UUID.nameUUIDFromBytes(name.toLowerCase().getBytes()).toString());
                        authorDTO.setName(name);
                        paper.getAuthors().add(authorDTO);
                    }
                }
            }

            // Fields of Study
            List<String> fields = (List<String>) paperMap.get("fieldsOfStudy");
            if (fields != null) {
                for (String field : fields) {
                    TopicDTO topic = new TopicDTO();
                    topic.setId(UUID.nameUUIDFromBytes(field.toLowerCase().getBytes()).toString());
                    topic.setName(field);
                    topic.setCategory("Field of Study");
                    paper.getTopics().add(topic);
                }
            }

            if (paper.getDoi() != null && !paper.getDoi().isBlank()) {
                paper.setId(UUID.nameUUIDFromBytes(("doi:" + paper.getDoi().toLowerCase()).getBytes()).toString());
            } else {
                paper.setId(UUID.nameUUIDFromBytes(("title:" + paper.getTitle().toLowerCase()).getBytes()).toString());
            }

            return paper;
        } catch (Exception e) {
            log.warn("Could not map Semantic Scholar paper: {}", e.getMessage());
            return null;
        }
    }
}
