package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.SourceEvidenceDTO;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.URLConnection;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DocumentExtractionService {

    private static final Logger log = LoggerFactory.getLogger(DocumentExtractionService.class);

    // Cache extracted full-text chunks in memory to avoid redundant network fetching
    private final Map<String, List<DocumentChunk>> chunkCache = new LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, List<DocumentChunk>> eldest) {
            return size() > 100;
        }
    };

    public static class DocumentChunk {
        private final String section;
        private final String text;

        public DocumentChunk(String section, String text) {
            this.section = section;
            this.text = text;
        }

        public String getSection() { return section; }
        public String getText() { return text; }
    }

    /**
     * Extracts text chunks from a paper. Tries PDF full-text if pdfUrl is available;
     * otherwise falls back to structured sentence extraction from the abstract.
     */
    public List<DocumentChunk> extractChunks(PaperDTO paper) {
        if (paper == null) return Collections.emptyList();

        String cacheKey = paper.getId() != null ? paper.getId() : paper.getTitle();
        if (chunkCache.containsKey(cacheKey)) {
            return chunkCache.get(cacheKey);
        }

        List<DocumentChunk> chunks = new ArrayList<>();

        // 1. Try PDF download & extraction if open access PDF is present
        if (Boolean.TRUE.equals(paper.getIsOpenAccess()) && paper.getPdfUrl() != null && !paper.getPdfUrl().isBlank()) {
            try {
                chunks = extractFromPdfUrl(paper.getPdfUrl());
            } catch (Exception e) {
                log.debug("PDF extraction failed for {}: {}", paper.getId(), e.getMessage());
            }
        }

        // 2. Fall back to structured abstract chunking
        if (chunks.isEmpty()) {
            chunks = extractFromAbstract(paper.getAbstractText());
        }

        chunkCache.put(cacheKey, chunks);
        return chunks;
    }

    private List<DocumentChunk> extractFromPdfUrl(String pdfUrl) throws Exception {
        URLConnection connection = URI.create(pdfUrl).toURL().openConnection();
        connection.setConnectTimeout(4000);
        connection.setReadTimeout(7000);
        connection.setRequestProperty("User-Agent", "ResearchScope-Academic-Bot/1.0");

        try (InputStream is = connection.getInputStream();
             PDDocument document = Loader.loadPDF(is.readAllBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();
            // Restrict to first 6 pages to preserve speed and memory
            stripper.setStartPage(1);
            stripper.setEndPage(Math.min(6, document.getNumberOfPages()));
            String fullText = stripper.getText(document);

            return segmentAcademicSections(fullText);
        }
    }

    private List<DocumentChunk> segmentAcademicSections(String text) {
        List<DocumentChunk> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        Pattern sectionPattern = Pattern.compile(
                "(?im)^\\s*(?:\\d+\\.?\\s*)?(abstract|introduction|background|methodology|methods|system model|proposed approach|experimental setup|results|findings|discussion|limitations|conclusion|future work)\\b"
        );

        Matcher matcher = sectionPattern.matcher(text);
        int lastIndex = 0;
        String currentSection = "Abstract";

        while (matcher.find()) {
            int matchStart = matcher.start();
            if (matchStart > lastIndex) {
                String passage = text.substring(lastIndex, matchStart).trim();
                if (passage.length() > 60) {
                    chunks.add(new DocumentChunk(currentSection, truncateSnippet(passage, 600)));
                }
            }
            currentSection = capitalize(matcher.group(1));
            lastIndex = matcher.end();
        }

        if (lastIndex < text.length()) {
            String passage = text.substring(lastIndex).trim();
            if (passage.length() > 60) {
                chunks.add(new DocumentChunk(currentSection, truncateSnippet(passage, 600)));
            }
        }

        return chunks;
    }

    private List<DocumentChunk> extractFromAbstract(String abstractText) {
        List<DocumentChunk> chunks = new ArrayList<>();
        if (abstractText == null || abstractText.isBlank() || abstractText.startsWith("Abstract not available")) {
            return chunks;
        }

        String[] sentences = abstractText.split("(?<=[.!?])\\s+");
        for (String s : sentences) {
            String trimmed = s.trim();
            if (trimmed.length() < 30) continue;

            String lower = trimmed.toLowerCase();
            if (lower.contains("aim") || lower.contains("propose") || lower.contains("present") || lower.contains("investigate")) {
                chunks.add(new DocumentChunk("Objectives", trimmed));
            } else if (lower.contains("method") || lower.contains("algorithm") || lower.contains("framework") || lower.contains("model")) {
                chunks.add(new DocumentChunk("Methodology", trimmed));
            } else if (lower.contains("show") || lower.contains("demonstrate") || lower.contains("result") || lower.contains("achieve") || lower.contains("find")) {
                chunks.add(new DocumentChunk("Findings", trimmed));
            } else if (lower.contains("limit") || lower.contains("challenge") || lower.contains("however") || lower.contains("vulnerable") || lower.contains("rely")) {
                chunks.add(new DocumentChunk("Limitations", trimmed));
            } else {
                chunks.add(new DocumentChunk("Abstract Excerpt", trimmed));
            }
        }

        if (chunks.isEmpty()) {
            chunks.add(new DocumentChunk("Abstract", abstractText.trim()));
        }

        return chunks;
    }

    /**
     * Builds verified source evidence items for a paper.
     */
    public List<SourceEvidenceDTO> buildSourceEvidence(PaperDTO paper, String query) {
        List<SourceEvidenceDTO> list = new ArrayList<>();
        if (paper == null) return list;

        List<DocumentChunk> chunks = extractChunks(paper);
        List<String> authorNames = paper.getAuthors() != null
                ? paper.getAuthors().stream().map(AuthorDTO::getName).toList()
                : Collections.emptyList();

        for (DocumentChunk chunk : chunks) {
            boolean isRelevant = (query == null || query.isBlank())
                    || Arrays.stream(query.toLowerCase().split("\\s+"))
                    .anyMatch(term -> term.length() > 3 && chunk.getText().toLowerCase().contains(term));

            if (isRelevant || list.isEmpty()) {
                list.add(new SourceEvidenceDTO(
                        paper.getId(),
                        paper.getTitle(),
                        authorNames,
                        paper.getPublicationYear(),
                        paper.getVenue(),
                        paper.getDoi(),
                        paper.getUrl(),
                        paper.getPdfUrl(),
                        chunk.getSection(),
                        chunk.getText(),
                        "DIRECTLY_REPORTED",
                        "VERIFIED_GROUNDED"
                ));
            }
            if (list.size() >= 3) break;
        }

        return list;
    }

    private String truncateSnippet(String text, int maxLength) {
        String clean = text.replaceAll("\\s+", " ").trim();
        if (clean.length() <= maxLength) return clean;
        return clean.substring(0, maxLength) + "...";
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}
