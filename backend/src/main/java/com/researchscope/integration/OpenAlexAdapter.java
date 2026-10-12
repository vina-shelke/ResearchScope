package com.researchscope.integration;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.InstitutionDTO;
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
public class OpenAlexAdapter {

    private static final Logger log = LoggerFactory.getLogger(OpenAlexAdapter.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${scholarly.openalex.base-url:https://api.openalex.org}")
    private String baseUrl;

    public List<PaperDTO> searchWorks(String query, int limit) {
        List<PaperDTO> results = new ArrayList<>();
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format("%s/works?search=%s&per-page=%d", baseUrl, encodedQuery, Math.min(limit, 50));
            
            log.info("Fetching OpenAlex works from: {}", url);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("results")) {
                return results;
            }

            List<Map<String, Object>> works = (List<Map<String, Object>>) response.get("results");
            for (Map<String, Object> work : works) {
                PaperDTO paper = mapWorkToPaperDTO(work);
                if (paper != null) {
                    results.add(paper);
                }
            }
        } catch (Exception e) {
            log.error("Error querying OpenAlex API: {}", e.getMessage(), e);
        }
        return results;
    }

    private PaperDTO mapWorkToPaperDTO(Map<String, Object> work) {
        try {
            PaperDTO paper = new PaperDTO();
            String id = (String) work.get("id");
            paper.setSourceId(id);
            paper.setSource("OpenAlex");

            String doi = (String) work.get("doi");
            if (doi != null) {
                paper.setDoi(doi.replace("https://doi.org/", "").trim());
            }

            String title = (String) work.get("title");
            if (title == null || title.isBlank()) return null;
            paper.setTitle(title.trim());

            // Abstract from inverted index if present
            Map<String, List<Integer>> invertedIndex = (Map<String, List<Integer>>) work.get("abstract_inverted_index");
            if (invertedIndex != null && !invertedIndex.isEmpty()) {
                paper.setAbstractText(reconstructAbstract(invertedIndex));
            } else {
                paper.setAbstractText("Abstract not available for this article.");
            }

            Object pubYear = work.get("publication_year");
            if (pubYear instanceof Number n) {
                paper.setPublicationYear(n.intValue());
            }
            paper.setPublicationDate((String) work.get("publication_date"));

            // Venue / Primary location
            Map<String, Object> primaryLocation = (Map<String, Object>) work.get("primary_location");
            if (primaryLocation != null) {
                Map<String, Object> sourceMap = (Map<String, Object>) primaryLocation.get("source");
                if (sourceMap != null && sourceMap.containsKey("display_name")) {
                    paper.setVenue((String) sourceMap.get("display_name"));
                }
                paper.setUrl((String) primaryLocation.get("landing_page_url"));
            }

            // Citation Count
            Object citeCount = work.get("cited_by_count");
            if (citeCount instanceof Number n) {
                paper.setCitationCount(n.intValue());
            }

            // Authors & Institutions & Countries
            List<Map<String, Object>> authorships = (List<Map<String, Object>>) work.get("authorships");
            if (authorships != null) {
                Set<String> countrySet = new HashSet<>();
                for (Map<String, Object> authorship : authorships) {
                    Map<String, Object> authorMap = (Map<String, Object>) authorship.get("author");
                    if (authorMap != null) {
                        String authorName = (String) authorMap.get("display_name");
                        String authorId = (String) authorMap.get("id");
                        if (authorName != null) {
                            AuthorDTO authorDTO = new AuthorDTO();
                            authorDTO.setId(UUID.nameUUIDFromBytes(authorName.toLowerCase().getBytes()).toString());
                            authorDTO.setName(authorName);
                            authorDTO.setOpenAlexId(authorId);
                            paper.getAuthors().add(authorDTO);
                        }
                    }

                    List<Map<String, Object>> insts = (List<Map<String, Object>>) authorship.get("institutions");
                    if (insts != null) {
                        for (Map<String, Object> inst : insts) {
                            String instName = (String) inst.get("display_name");
                            String countryCode = (String) inst.get("country_code");
                            if (instName != null) {
                                InstitutionDTO instDTO = new InstitutionDTO();
                                instDTO.setId(UUID.nameUUIDFromBytes(instName.toLowerCase().getBytes()).toString());
                                instDTO.setName(instName);
                                instDTO.setCountryCode(countryCode);
                                paper.getInstitutions().add(instDTO);
                            }
                            if (countryCode != null) countrySet.add(countryCode.toUpperCase());
                        }
                    }
                }
                paper.getCountries().addAll(countrySet);
            }

            // Topics / Concepts
            List<Map<String, Object>> concepts = (List<Map<String, Object>>) work.get("concepts");
            if (concepts != null) {
                for (Map<String, Object> concept : concepts) {
                    String conceptName = (String) concept.get("display_name");
                    if (conceptName != null) {
                        TopicDTO topic = new TopicDTO();
                        topic.setId(UUID.nameUUIDFromBytes(conceptName.toLowerCase().getBytes()).toString());
                        topic.setName(conceptName);
                        topic.setCategory("Field of Study");
                        paper.getTopics().add(topic);
                    }
                }
            }

            // Deterministic Paper ID based on DOI or Normalized Title
            if (paper.getDoi() != null && !paper.getDoi().isBlank()) {
                paper.setId(UUID.nameUUIDFromBytes(("doi:" + paper.getDoi().toLowerCase()).getBytes()).toString());
            } else {
                paper.setId(UUID.nameUUIDFromBytes(("title:" + paper.getTitle().toLowerCase()).getBytes()).toString());
            }

            return paper;
        } catch (Exception e) {
            log.warn("Could not map OpenAlex work: {}", e.getMessage());
            return null;
        }
    }

    private String reconstructAbstract(Map<String, List<Integer>> invertedIndex) {
        Map<Integer, String> wordMap = new TreeMap<>();
        for (Map.Entry<String, List<Integer>> entry : invertedIndex.entrySet()) {
            String word = entry.getKey();
            for (Integer pos : entry.getValue()) {
                wordMap.put(pos, word);
            }
        }
        return String.join(" ", wordMap.values());
    }
}
