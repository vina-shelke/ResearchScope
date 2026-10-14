package com.researchscope.integration;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class CrossrefAdapter {

    private static final Logger log = LoggerFactory.getLogger(CrossrefAdapter.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${scholarly.crossref.base-url:https://api.crossref.org}")
    private String baseUrl;

    public List<PaperDTO> searchWorks(String query, int limit) {
        List<PaperDTO> results = new ArrayList<>();
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format("%s/works?query=%s&rows=%d", baseUrl, encodedQuery, Math.min(limit, 25));

            log.info("Fetching Crossref works from: {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("message")) {
                return results;
            }

            Map<String, Object> message = (Map<String, Object>) response.get("message");
            List<Map<String, Object>> items = (List<Map<String, Object>>) message.get("items");
            if (items == null) return results;

            for (Map<String, Object> item : items) {
                PaperDTO paper = mapCrossrefItemToPaperDTO(item);
                if (paper != null) {
                    results.add(paper);
                }
            }
        } catch (Exception e) {
            log.error("Error querying Crossref API: {}", e.getMessage(), e);
        }
        return results;
    }

    private PaperDTO mapCrossrefItemToPaperDTO(Map<String, Object> item) {
        try {
            PaperDTO paper = new PaperDTO();
            paper.setSource("Crossref");

            String doi = (String) item.get("DOI");
            if (doi != null) {
                paper.setDoi(doi.trim());
                paper.setSourceId(doi);
            }

            List<String> titles = (List<String>) item.get("title");
            if (titles == null || titles.isEmpty()) return null;
            paper.setTitle(titles.get(0).trim());

            // Abstract
            String abstractText = (String) item.get("abstract");
            if (abstractText != null) {
                paper.setAbstractText(abstractText.replaceAll("<[^>]*>", "").trim());
            } else {
                paper.setAbstractText("Abstract not available for this record.");
            }

            // Publication Year
            Map<String, Object> issued = (Map<String, Object>) item.get("issued");
            if (issued != null) {
                List<List<Integer>> dateParts = (List<List<Integer>>) issued.get("date-parts");
                if (dateParts != null && !dateParts.isEmpty() && !dateParts.get(0).isEmpty()) {
                    paper.setPublicationYear(dateParts.get(0).get(0));
                    paper.setPublicationDate(String.valueOf(dateParts.get(0).get(0)));
                }
            }

            // Container / Venue & Publisher
            List<String> containerTitles = (List<String>) item.get("container-title");
            if (containerTitles != null && !containerTitles.isEmpty()) {
                paper.setVenue(containerTitles.get(0));
            }
            paper.setPublisher((String) item.get("publisher"));
            paper.setPaperType((String) item.get("type"));

            // Citations
            Object isReferencedBy = item.get("is-referenced-by-count");
            if (isReferencedBy instanceof Number n) {
                paper.setCitationCount(n.intValue());
            }

            // URL & PDF link
            paper.setUrl((String) item.get("URL"));
            List<Map<String, Object>> links = (List<Map<String, Object>>) item.get("link");
            if (links != null) {
                for (Map<String, Object> l : links) {
                    String contentType = (String) l.get("content-type");
                    String linkUrl = (String) l.get("URL");
                    if (linkUrl != null && contentType != null && contentType.toLowerCase().contains("pdf")) {
                        paper.setPdfUrl(linkUrl);
                        paper.setIsOpenAccess(true);
                        break;
                    }
                }
            }

            // Authors
            List<Map<String, Object>> authors = (List<Map<String, Object>>) item.get("author");
            if (authors != null) {
                for (Map<String, Object> author : authors) {
                    String given = (String) author.get("given");
                    String family = (String) author.get("family");
                    String fullName = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
                    String orcid = (String) author.get("ORCID");
                    if (!fullName.isEmpty()) {
                        AuthorDTO authorDTO = new AuthorDTO();
                        authorDTO.setId(UUID.nameUUIDFromBytes(fullName.toLowerCase().getBytes()).toString());
                        authorDTO.setName(fullName);
                        if (orcid != null) {
                            authorDTO.setOrcid(orcid.replace("https://orcid.org/", "").replace("http://orcid.org/", "").trim());
                        }
                        paper.getAuthors().add(authorDTO);
                    }
                }
            }

            if (paper.getDoi() != null && !paper.getDoi().isBlank()) {
                paper.setId(UUID.nameUUIDFromBytes(("doi:" + paper.getDoi().toLowerCase()).getBytes()).toString());
            } else {
                paper.setId(UUID.nameUUIDFromBytes(("title:" + paper.getTitle().toLowerCase()).getBytes()).toString());
            }

            return paper;
        } catch (Exception e) {
            log.warn("Could not map Crossref item: {}", e.getMessage());
            return null;
        }
    }
}
