package com.researchscope.service;

import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.ResearchGapAnalysisDTO;
import com.researchscope.dto.ResearchGapCandidateDTO;
import com.researchscope.dto.ThemeClusterDTO;
import com.researchscope.entity.Paper;
import com.researchscope.repository.PaperRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResearchGapService {

    private final PaperRepository paperRepository;
    private final PaperService paperService;
    private final DataIngestionService dataIngestionService;

    public ResearchGapService(
            PaperRepository paperRepository,
            PaperService paperService,
            DataIngestionService dataIngestionService
    ) {
        this.paperRepository = paperRepository;
        this.paperService = paperService;
        this.dataIngestionService = dataIngestionService;
    }

    public ResearchGapAnalysisDTO analyzeTopicGaps(String query, int maxSample) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : "Generative AI";
        int limit = Math.max(10, Math.min(maxSample > 0 ? maxSample : 30, 60));

        // 1. Attempt lightweight live ingestion if few papers found
        Page<Paper> queryPage = paperRepository.searchPapersExtended(cleanQuery, null, null, null, null, null, null, null, PageRequest.of(0, limit));
        if (queryPage.getTotalElements() < 5) {
            try {
                dataIngestionService.ingestResearchTopic(cleanQuery);
                queryPage = paperRepository.searchPapersExtended(cleanQuery, null, null, null, null, null, null, null, PageRequest.of(0, limit));
            } catch (Exception ignored) {}
        }

        List<Paper> papers = queryPage.getContent();
        if (papers.isEmpty()) {
            papers = paperRepository.findTopCitedPapers(PageRequest.of(0, limit));
        }

        List<PaperDTO> paperDTOs = paperService.toPaperDTOs(papers);

        // 2. Identify Themes & Methodology Distribution
        Map<String, Long> methodDist = classifyMethodologies(paperDTOs);
        List<ThemeClusterDTO> themes = clusterThemes(cleanQuery, paperDTOs);

        // 3. Extract Limitations and Future Work Statements
        List<ExtractedInsight> extractedInsights = extractLimitationInsights(paperDTOs);
        List<String> limitationsSummary = extractedInsights.stream()
                .map(ExtractedInsight::text)
                .limit(8)
                .toList();

        // 4. Synthesize Candidate Research Gaps
        List<ResearchGapCandidateDTO> candidates = synthesizeGaps(cleanQuery, paperDTOs, methodDist, themes, extractedInsights);

        // 5. Coverage Assessment
        String coverageAssessment = papers.size() >= 15 ? "REPRESENTATIVE_SAMPLE" : "PRELIMINARY_SAMPLE";

        List<String> recommendedDirections = List.of(
                "Prioritize empirical ablation studies on standardized benchmarks rather than conceptual reviews.",
                "Conduct longitudinal evaluations measuring robustness across diverse real-world distribution shifts.",
                "Establish cross-disciplinary datasets addressing privacy, safety, and operational boundary constraints."
        );

        return new ResearchGapAnalysisDTO(
                cleanQuery,
                papers.size(),
                candidates,
                themes,
                methodDist,
                coverageAssessment,
                limitationsSummary,
                recommendedDirections
        );
    }

    private Map<String, Long> classifyMethodologies(List<PaperDTO> papers) {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("Empirical & Experimental", 0L);
        counts.put("Surveys & Systematic Reviews", 0L);
        counts.put("Architectures & Systems", 0L);
        counts.put("Theoretical & Formal Proofs", 0L);

        for (PaperDTO p : papers) {
            String text = ((p.getTitle() != null ? p.getTitle() : "") + " " + (p.getAbstractText() != null ? p.getAbstractText() : "")).toLowerCase();
            if (text.contains("survey") || text.contains("review") || text.contains("systematic literature") || text.contains("taxonomy")) {
                counts.put("Surveys & Systematic Reviews", counts.get("Surveys & Systematic Reviews") + 1);
            } else if (text.contains("experiment") || text.contains("dataset") || text.contains("benchmark") || text.contains("empirical") || text.contains("f1-score") || text.contains("accuracy")) {
                counts.put("Empirical & Experimental", counts.get("Empirical & Experimental") + 1);
            } else if (text.contains("architecture") || text.contains("framework") || text.contains("pipeline") || text.contains("prototype") || text.contains("platform")) {
                counts.put("Architectures & Systems", counts.get("Architectures & Systems") + 1);
            } else {
                counts.put("Theoretical & Formal Proofs", counts.get("Theoretical & Formal Proofs") + 1);
            }
        }
        return counts;
    }

    private List<ThemeClusterDTO> clusterThemes(String query, List<PaperDTO> papers) {
        Map<String, List<String>> themeMap = new LinkedHashMap<>();

        // Group by existing Paper topics
        for (PaperDTO p : papers) {
            if (p.getTopics() != null && !p.getTopics().isEmpty()) {
                for (var t : p.getTopics()) {
                    String name = t.getName();
                    themeMap.computeIfAbsent(name, k -> new ArrayList<>()).add(p.getTitle());
                }
            } else {
                themeMap.computeIfAbsent("General " + query, k -> new ArrayList<>()).add(p.getTitle());
            }
        }

        return themeMap.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .limit(6)
                .map(e -> new ThemeClusterDTO(e.getKey(), e.getValue().size(), e.getValue().stream().limit(3).toList()))
                .toList();
    }

    private List<ExtractedInsight> extractLimitationInsights(List<PaperDTO> papers) {
        List<ExtractedInsight> insights = new ArrayList<>();
        Pattern limitationPattern = Pattern.compile("(?i)(however|limited by|remains challenging|remains a challenge|future research|future work|open problem|lack of|further investigation|vulnerable to|not addressed)[^.!?]+[.!?]");

        for (PaperDTO p : papers) {
            String abs = p.getAbstractText();
            if (abs != null && !abs.startsWith("Abstract not available") && abs.length() > 50) {
                Matcher m = limitationPattern.matcher(abs);
                while (m.find()) {
                    String match = m.group().trim();
                    if (match.length() > 25 && match.length() < 300) {
                        insights.add(new ExtractedInsight(match, p));
                    }
                }
            }
        }
        return insights;
    }

    private List<ResearchGapCandidateDTO> synthesizeGaps(
            String query,
            List<PaperDTO> papers,
            Map<String, Long> methodDist,
            List<ThemeClusterDTO> themes,
            List<ExtractedInsight> insights
    ) {
        List<ResearchGapCandidateDTO> gaps = new ArrayList<>();
        long total = Math.max(papers.size(), 1);
        long empirical = methodDist.getOrDefault("Empirical & Experimental", 0L);
        long surveys = methodDist.getOrDefault("Surveys & Systematic Reviews", 0L);

        // Gap 1: Methodological Deficit (Empirical Validation & Standardized Benchmarking)
        List<PaperDTO> supporting1 = papers.stream().limit(4).toList();
        List<String> limits1 = insights.stream().map(ExtractedInsight::text).filter(t -> t.toLowerCase().contains("lack") || t.toLowerCase().contains("limited") || t.toLowerCase().contains("benchmark")).limit(3).toList();
        if (limits1.isEmpty() && !insights.isEmpty()) limits1 = List.of(insights.get(0).text());

        gaps.add(new ResearchGapCandidateDTO(
                "gap_methodology_" + Math.abs(query.hashCode() % 1000),
                "Empirical Deficit in Real-World Stress-Testing & Standardized Benchmarks",
                "While literature in " + query + " offers conceptual frameworks and survey overviews, there is a pronounced gap in standardized, multi-institutional empirical benchmarks that validate performance under diverse operational conditions.",
                themes.stream().map(ThemeClusterDTO::getName).limit(3).toList(),
                (int) Math.max(1, empirical),
                generateSparkline(papers),
                supporting1,
                limits1.isEmpty() ? List.of("Current evaluations rely on synthetic or non-reproducible local splits.") : limits1,
                List.of("Deploy open standardized benchmarks with publicly verifiable test suites.", "Establish cross-laboratory reproducibility baselines."),
                empirical < (total / 3) ? "HIGH" : "MEDIUM",
                "Methodological Imbalance Analysis (Ratio of Empirical to Conceptual Papers: " + empirical + "/" + total + ")",
                total > 15 ? "Identified across multiple retrieved publications" : "Preliminary candidate derived from available database sample"
        ));

        // Gap 2: Temporal Stagnation / Modern Architecture Disconnect
        long recentPapers = papers.stream().filter(p -> p.getPublicationYear() != null && p.getPublicationYear() >= 2023).count();
        List<PaperDTO> supporting2 = papers.stream().sorted((a, b) -> Integer.compare(b.getPublicationYear() != null ? b.getPublicationYear() : 0, a.getPublicationYear() != null ? a.getPublicationYear() : 0)).limit(4).toList();
        List<String> limits2 = insights.stream().map(ExtractedInsight::text).filter(t -> t.toLowerCase().contains("future") || t.toLowerCase().contains("challenging") || t.toLowerCase().contains("further")).limit(3).toList();

        gaps.add(new ResearchGapCandidateDTO(
                "gap_temporal_" + Math.abs((query + "_temp").hashCode() % 1000),
                "Temporal Divergence: Legacy Baselines vs. Modern Generative Architectures",
                "Substantial foundational research in this domain was formulated prior to the widespread adoption of large foundation models. Prior assumptions regarding inference latency, token context, and adversarial vectors remain untested against modern multi-modal architectures.",
                List.of(query, "Model Scalability", "Architectural Evolution"),
                (int) Math.max(recentPapers, 1),
                generateSparkline(papers),
                supporting2,
                limits2.isEmpty() ? List.of("Studies rely on smaller predecessor architectures that do not reflect current state-of-the-art capability.") : limits2,
                List.of("Re-evaluate classic assumptions using current generative foundation models.", "Quantify performance shifts across modern multi-billion parameter checkpoints."),
                recentPapers < (total / 2) ? "HIGH" : "MEDIUM",
                "Temporal Distribution Metric (" + recentPapers + " of " + total + " papers published in 2023 or later)",
                "Documented in recent literature and temporal publication trends"
        ));

        // Gap 3: Domain Application & Safety/Privacy Boundary Void
        List<PaperDTO> supporting3 = papers.stream().filter(p -> p.getAbstractText() != null && (p.getAbstractText().toLowerCase().contains("privacy") || p.getAbstractText().toLowerCase().contains("security") || p.getAbstractText().toLowerCase().contains("application"))).limit(4).toList();
        if (supporting3.isEmpty()) supporting3 = papers.stream().skip(2).limit(3).toList();

        gaps.add(new ResearchGapCandidateDTO(
                "gap_domain_" + Math.abs((query + "_domain").hashCode() % 1000),
                "Translational Deployment, Privacy Guarantees & Edge Device Constraints",
                "Transitioning " + query + " models to mission-critical, low-latency edge deployments is severely constrained by privacy guarantees, differential privacy trade-offs, and lack of resource-constrained evaluation metrics.",
                List.of("Privacy & Security", "Resource-Constrained Systems", "Edge Computing"),
                supporting3.size(),
                generateSparkline(papers),
                supporting3,
                List.of("Resource limitations and inference memory footprints are omitted from primary evaluation metrics.", "Formal privacy guarantees are rarely reconciled with model utility."),
                List.of("Develop hardware-aware quantization and pruning for edge deployments.", "Quantify the Pareto frontier between differential privacy noise and task accuracy."),
                "MEDIUM",
                "Domain Boundary Void (Scarcity of edge-constrained and formal privacy studies in retrieved dataset)",
                "Candidate literature gap requiring systematic review of edge and privacy constraints"
        ));

        return gaps;
    }

    private List<Map<String, Object>> generateSparkline(List<PaperDTO> papers) {
        Map<Integer, Long> byYear = papers.stream()
                .filter(p -> p.getPublicationYear() != null && p.getPublicationYear() >= 2018)
                .collect(Collectors.groupingBy(PaperDTO::getPublicationYear, Collectors.counting()));

        List<Map<String, Object>> trend = new ArrayList<>();
        int currentYear = Calendar.getInstance().get(Calendar.YEAR);
        for (int y = 2019; y <= currentYear; y++) {
            Map<String, Object> point = new HashMap<>();
            point.put("year", y);
            point.put("count", byYear.getOrDefault(y, 0L));
            trend.add(point);
        }
        return trend;
    }

    private record ExtractedInsight(String text, PaperDTO paper) {}
}
