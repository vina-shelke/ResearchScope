package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperComparisonItemDTO;
import com.researchscope.dto.PaperComparisonMatrixDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.entity.Paper;
import com.researchscope.repository.PaperRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PaperComparisonService {

    private final PaperRepository paperRepository;
    private final PaperService paperService;

    private static final List<String> COMMON_ALGORITHMS = List.of(
            "Transformer", "Convolutional Neural Network", "Deep Neural Network", "Reinforcement Learning",
            "Supervised Learning", "Unsupervised Learning", "Transfer Learning", "Ablation Study",
            "Empirical Benchmark", "Heuristic Search", "Bayesian Optimization", "Fine-Tuning",
            "Large Language Model", "Attention Mechanism", "Decision Tree", "Support Vector Machine"
    );

    private static final List<String> COMMON_METRICS = List.of(
            "Accuracy", "F1-Score", "Precision", "Recall", "BLEU", "ROUGE", "Loss", "AUC-ROC",
            "Mean Squared Error", "Perplexity", "Latency", "Throughput", "Execution Time"
    );

    public PaperComparisonService(PaperRepository paperRepository, PaperService paperService) {
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }

    public PaperComparisonMatrixDTO comparePapers(List<String> paperIds) {
        if (paperIds == null || paperIds.isEmpty()) {
            return new PaperComparisonMatrixDTO(Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), "No papers selected for comparison.");
        }

        List<String> uniqueIds = paperIds.stream().distinct().limit(6).toList();
        List<Paper> papers = paperRepository.findAllById(uniqueIds);
        List<PaperDTO> paperDTOs = paperService.toPaperDTOs(papers);

        List<PaperComparisonItemDTO> items = paperDTOs.stream().map(this::extractComparisonItem).toList();

        // 1. Identify common methods
        Map<String, Integer> methodCounts = new HashMap<>();
        for (PaperComparisonItemDTO item : items) {
            for (String m : item.getMethodsAndAlgorithms()) {
                if (!m.equalsIgnoreCase("Not available")) {
                    methodCounts.put(m, methodCounts.getOrDefault(m, 0) + 1);
                }
            }
        }
        List<String> commonMethods = methodCounts.entrySet().stream()
                .filter(e -> e.getValue() > 1)
                .map(Map.Entry::getKey)
                .toList();

        // 2. Identify common limitations
        List<String> commonLimitations = items.stream()
                .map(PaperComparisonItemDTO::getLimitations)
                .filter(l -> !l.equalsIgnoreCase("Not available"))
                .distinct()
                .limit(4)
                .toList();

        // 3. Synthesis summary
        String summary = generateComparisonSummary(items, commonMethods);

        return new PaperComparisonMatrixDTO(items, commonMethods, commonLimitations, summary);
    }

    public String exportComparisonCsv(List<String> paperIds) {
        PaperComparisonMatrixDTO matrix = comparePapers(paperIds);
        StringBuilder sb = new StringBuilder();

        sb.append("Dimension");
        for (PaperComparisonItemDTO p : matrix.getPapers()) {
            sb.append(",\"").append(escapeCsv(p.getTitle())).append("\"");
        }
        sb.append("\n");

        appendCsvRow(sb, "Publication Year", matrix.getPapers().stream().map(p -> String.valueOf(p.getPublicationYear())).toList());
        appendCsvRow(sb, "Authors", matrix.getPapers().stream().map(p -> String.join("; ", p.getAuthors())).toList());
        appendCsvRow(sb, "Venue", matrix.getPapers().stream().map(PaperComparisonItemDTO::getVenue).toList());
        appendCsvRow(sb, "Citations", matrix.getPapers().stream().map(p -> String.valueOf(p.getCitationCount())).toList());
        appendCsvRow(sb, "DOI", matrix.getPapers().stream().map(PaperComparisonItemDTO::getDoi).toList());
        appendCsvRow(sb, "Research Problem", matrix.getPapers().stream().map(PaperComparisonItemDTO::getResearchProblem).toList());
        appendCsvRow(sb, "Methods & Algorithms", matrix.getPapers().stream().map(p -> String.join("; ", p.getMethodsAndAlgorithms())).toList());
        appendCsvRow(sb, "Datasets & Samples", matrix.getPapers().stream().map(PaperComparisonItemDTO::getDatasetsAndSamples).toList());
        appendCsvRow(sb, "Evaluation Metrics", matrix.getPapers().stream().map(p -> String.join("; ", p.getEvaluationMetrics())).toList());
        appendCsvRow(sb, "Main Findings", matrix.getPapers().stream().map(PaperComparisonItemDTO::getMainFindings).toList());
        appendCsvRow(sb, "Limitations", matrix.getPapers().stream().map(PaperComparisonItemDTO::getLimitations).toList());
        appendCsvRow(sb, "Future Directions", matrix.getPapers().stream().map(PaperComparisonItemDTO::getFutureDirections).toList());

        return sb.toString();
    }

    private PaperComparisonItemDTO extractComparisonItem(PaperDTO paper) {
        String abs = paper.getAbstractText() != null ? paper.getAbstractText() : "";
        boolean hasAbstract = !abs.isBlank() && !abs.startsWith("Abstract not available");

        List<String> authorNames = paper.getAuthors() != null
                ? paper.getAuthors().stream().map(AuthorDTO::getName).toList()
                : Collections.emptyList();

        String problem = hasAbstract ? extractSentence(abs, "(aims to|investigates|addresses|proposes|focuses on|presents a|explores)") : "Not available";
        String questions = hasAbstract ? extractSentence(abs, "(whether|how|why|can we|we investigate whether)") : "Not available";

        List<String> methods = new ArrayList<>();
        if (paper.getTopics() != null) {
            paper.getTopics().forEach(t -> {
                String name = t.getName();
                if (name.contains("Algorithm") || name.contains("Learning") || name.contains("Network") ||
                    name.contains("Transformer") || name.contains("Model") || name.contains("Intelligence") ||
                    name.contains("Vision") || name.contains("Language")) {
                    methods.add(name);
                }
            });
        }
        for (String algo : COMMON_ALGORITHMS) {
            if (abs.toLowerCase().contains(algo.toLowerCase())) {
                methods.add(algo);
            }
        }
        if (methods.isEmpty()) methods.add("Not available");

        String datasets = hasAbstract ? extractSentence(abs, "(dataset|benchmark|corpus|evaluated on|trained on|tested on)") : "Not available";

        List<String> metrics = new ArrayList<>();
        for (String m : COMMON_METRICS) {
            if (abs.toLowerCase().contains(m.toLowerCase())) {
                metrics.add(m);
            }
        }
        if (metrics.isEmpty()) metrics.add("Not available");

        String findings = hasAbstract ? extractSentence(abs, "(results show|we find that|demonstrates|achieves|outperforms|reveals)") : "Not available";
        String limitations = hasAbstract ? extractSentence(abs, "(however|limited by|remains a challenge|challenging to|vulnerable to)") : "Not available";
        String future = hasAbstract ? extractSentence(abs, "(future research|further investigation|open direction|future work)") : "Not available";

        return new PaperComparisonItemDTO(
                paper.getId(),
                paper.getTitle(),
                authorNames,
                paper.getPublicationYear(),
                paper.getVenue(),
                paper.getDoi(),
                paper.getUrl(),
                paper.getCitationCount() != null ? paper.getCitationCount() : 0,
                paper.getIsOpenAccess(),
                problem,
                questions,
                methods.stream().distinct().limit(4).toList(),
                datasets,
                metrics.stream().distinct().limit(4).toList(),
                findings,
                limitations,
                future
        );
    }

    private String extractSentence(String text, String keywordRegex) {
        Pattern pattern = Pattern.compile("(?i)([^.!?]*" + keywordRegex + "[^.!?]*[.!?])");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String match = matcher.group().trim().replaceAll("\\s+", " ");
            if (match.length() > 200) {
                return match.substring(0, 197) + "...";
            }
            return match;
        }
        return "Not available";
    }

    private String generateComparisonSummary(List<PaperComparisonItemDTO> items, List<String> commonMethods) {
        if (items.isEmpty()) return "No papers to compare.";

        StringBuilder sb = new StringBuilder();
        sb.append("Comparison of ").append(items.size()).append(" scholarly publications across ").append(items.stream().map(p -> String.valueOf(p.getPublicationYear())).distinct().count()).append(" distinct publication years. ");

        if (!commonMethods.isEmpty()) {
            sb.append("Identified common methodological paradigms: ").append(String.join(", ", commonMethods)).append(". ");
        } else {
            sb.append("Publications utilize divergent methodological approaches without identical algorithmic overlap. ");
        }

        long oaCount = items.stream().filter(p -> Boolean.TRUE.equals(p.getIsOpenAccess())).count();
        sb.append("Open Access availability: ").append(oaCount).append(" of ").append(items.size()).append(" papers provide verified full text.");

        return sb.toString();
    }

    private void appendCsvRow(StringBuilder sb, String header, List<String> values) {
        sb.append("\"").append(escapeCsv(header)).append("\"");
        for (String v : values) {
            sb.append(",\"").append(escapeCsv(v != null ? v : "Not available")).append("\"");
        }
        sb.append("\n");
    }

    private String escapeCsv(String str) {
        if (str == null) return "";
        return str.replace("\"", "\"\"");
    }
}
