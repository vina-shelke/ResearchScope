package com.researchscope.service;

import com.researchscope.dto.*;
import com.researchscope.entity.*;
import com.researchscope.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResearchConnectionService {

    private final PaperRepository paperRepository;
    private final PaperReferenceRepository paperReferenceRepository;
    private final AuthorRepository authorRepository;
    private final InstitutionRepository institutionRepository;
    private final TopicRepository topicRepository;
    private final PaperService paperService;

    public ResearchConnectionService(
            PaperRepository paperRepository,
            PaperReferenceRepository paperReferenceRepository,
            AuthorRepository authorRepository,
            InstitutionRepository institutionRepository,
            TopicRepository topicRepository,
            PaperService paperService
    ) {
        this.paperRepository = paperRepository;
        this.paperReferenceRepository = paperReferenceRepository;
        this.authorRepository = authorRepository;
        this.institutionRepository = institutionRepository;
        this.topicRepository = topicRepository;
        this.paperService = paperService;
    }

    public ResearchGraphDTO getResearchGraph(
            String query,
            Integer year,
            String topic,
            String author,
            String institution,
            List<String> relationshipTypes,
            int limit
    ) {
        int effectiveLimit = Math.max(5, Math.min(limit > 0 ? limit : 15, 30));
        List<Paper> papers;

        boolean hasFilter = (query != null && !query.isBlank()) || year != null ||
                (topic != null && !topic.isBlank()) || (author != null && !author.isBlank()) ||
                (institution != null && !institution.isBlank());

        if (hasFilter) {
            Page<Paper> page = paperRepository.searchPapersExtended(
                    query, year, null, null, null, null, author, institution, PageRequest.of(0, effectiveLimit)
            );
            papers = page.getContent();
            if (papers.isEmpty() && query != null && !query.isBlank()) {
                papers = paperRepository.findTopCitedPapers(PageRequest.of(0, effectiveLimit));
            }
        } else {
            papers = paperRepository.findTopCitedPapers(PageRequest.of(0, effectiveLimit));
        }

        return buildGraphFromPapers(papers, relationshipTypes);
    }

    public ResearchGraphDTO expandNode(String nodeId, String nodeType, int maxNeighbors) {
        int limit = Math.max(3, Math.min(maxNeighbors > 0 ? maxNeighbors : 8, 15));
        List<ResearchGraphDTO.Node> newNodes = new ArrayList<>();
        List<ResearchGraphDTO.Link> newLinks = new ArrayList<>();
        Set<String> addedIds = new HashSet<>();

        if ("Paper".equalsIgnoreCase(nodeType)) {
            String cleanId = nodeId.replace("paper_", "");
            Optional<Paper> pOpt = paperRepository.findById(cleanId);
            if (pOpt.isPresent()) {
                PaperDTO p = paperService.toPaperDTO(pOpt.get());
                String pNodeId = "paper_" + p.getId();

                for (AuthorDTO a : p.getAuthors()) {
                    String aId = "author_" + a.getId();
                    newNodes.add(new ResearchGraphDTO.Node(aId, a.getName(), "Author", a.getPaperCount(), null, "Author", null));
                    newLinks.add(new ResearchGraphDTO.Link(aId, pNodeId, "WROTE"));
                }
                for (TopicDTO t : p.getTopics()) {
                    String tId = "topic_" + t.getId();
                    newNodes.add(new ResearchGraphDTO.Node(tId, t.getName(), "Topic", t.getPaperCount(), null, "Topic", null));
                    newLinks.add(new ResearchGraphDTO.Link(pNodeId, tId, "HAS_TOPIC"));
                }
                for (InstitutionDTO i : p.getInstitutions()) {
                    String iId = "inst_" + i.getId();
                    newNodes.add(new ResearchGraphDTO.Node(iId, i.getName(), "Institution", i.getPaperCount(), null, "Institution", null));
                    newLinks.add(new ResearchGraphDTO.Link(pNodeId, iId, "AFFILIATED_WITH"));
                }
                // Fetch references
                List<PaperReference> refs = paperReferenceRepository.findByPaperId(cleanId);
                for (PaperReference r : refs.stream().limit(limit).toList()) {
                    paperRepository.findById(r.getReferencedPaperId()).ifPresent(refPaper -> {
                        String refNodeId = "paper_" + refPaper.getId();
                        newNodes.add(new ResearchGraphDTO.Node(refNodeId, truncateTitle(refPaper.getTitle()), "Paper", refPaper.getCitationCount(), refPaper.getPublicationYear(), refPaper.getVenue(), refPaper.getDoi()));
                        newLinks.add(new ResearchGraphDTO.Link(pNodeId, refNodeId, "CITES"));
                    });
                }
            }
        } else if ("Author".equalsIgnoreCase(nodeType)) {
            String cleanId = nodeId.replace("author_", "");
            List<Paper> authorPapers = paperRepository.findPapersByAuthorId(cleanId);
            String aNodeId = "author_" + cleanId;
            for (Paper p : authorPapers.stream().limit(limit).toList()) {
                String pNodeId = "paper_" + p.getId();
                newNodes.add(new ResearchGraphDTO.Node(pNodeId, truncateTitle(p.getTitle()), "Paper", p.getCitationCount(), p.getPublicationYear(), p.getVenue(), p.getDoi()));
                newLinks.add(new ResearchGraphDTO.Link(aNodeId, pNodeId, "WROTE"));
            }
        } else if ("Topic".equalsIgnoreCase(nodeType)) {
            String cleanId = nodeId.replace("topic_", "");
            List<Paper> topicPapers = paperRepository.findPapersByTopicId(cleanId);
            String tNodeId = "topic_" + cleanId;
            for (Paper p : topicPapers.stream().limit(limit).toList()) {
                String pNodeId = "paper_" + p.getId();
                newNodes.add(new ResearchGraphDTO.Node(pNodeId, truncateTitle(p.getTitle()), "Paper", p.getCitationCount(), p.getPublicationYear(), p.getVenue(), p.getDoi()));
                newLinks.add(new ResearchGraphDTO.Link(pNodeId, tNodeId, "HAS_TOPIC"));
            }
        } else if ("Institution".equalsIgnoreCase(nodeType)) {
            String cleanId = nodeId.replace("inst_", "");
            List<Paper> instPapers = paperRepository.findPapersByInstitutionId(cleanId);
            String iNodeId = "inst_" + cleanId;
            for (Paper p : instPapers.stream().limit(limit).toList()) {
                String pNodeId = "paper_" + p.getId();
                newNodes.add(new ResearchGraphDTO.Node(pNodeId, truncateTitle(p.getTitle()), "Paper", p.getCitationCount(), p.getPublicationYear(), p.getVenue(), p.getDoi()));
                newLinks.add(new ResearchGraphDTO.Link(pNodeId, iNodeId, "AFFILIATED_WITH"));
            }
        }

        // Deduplicate nodes
        Map<String, ResearchGraphDTO.Node> uniqueNodes = new LinkedHashMap<>();
        for (ResearchGraphDTO.Node n : newNodes) {
            uniqueNodes.put(n.getId(), n);
        }

        return new ResearchGraphDTO(new ArrayList<>(uniqueNodes.values()), newLinks);
    }

    private ResearchGraphDTO buildGraphFromPapers(List<Paper> papers, List<String> relationshipTypes) {
        List<ResearchGraphDTO.Node> nodes = new ArrayList<>();
        List<ResearchGraphDTO.Link> links = new ArrayList<>();
        Set<String> addedNodeIds = new HashSet<>();

        Set<String> relFilter = (relationshipTypes != null && !relationshipTypes.isEmpty())
                ? relationshipTypes.stream().map(String::toUpperCase).collect(Collectors.toSet())
                : Set.of("WROTE", "HAS_TOPIC", "AFFILIATED_WITH", "CITES", "SIMILAR_TOPIC");

        List<PaperDTO> paperDTOs = paperService.toPaperDTOs(papers);
        Map<String, Set<String>> paperTopicsMap = new HashMap<>();

        for (PaperDTO paperDTO : paperDTOs) {
            String paperNodeId = "paper_" + paperDTO.getId();
            if (!addedNodeIds.contains(paperNodeId)) {
                String detail = (paperDTO.getPublicationYear() != null ? paperDTO.getPublicationYear() + " • " : "")
                        + (paperDTO.getVenue() != null ? paperDTO.getVenue() : "Journal/Conference");
                nodes.add(new ResearchGraphDTO.Node(
                        paperNodeId,
                        truncateTitle(paperDTO.getTitle()),
                        "Paper",
                        paperDTO.getCitationCount(),
                        paperDTO.getPublicationYear(),
                        detail,
                        paperDTO.getDoi()
                ));
                addedNodeIds.add(paperNodeId);
            }

            Set<String> topicIds = new HashSet<>();

            // Authors & WROTE links
            for (AuthorDTO author : paperDTO.getAuthors()) {
                String authorNodeId = "author_" + author.getId();
                if (!addedNodeIds.contains(authorNodeId)) {
                    nodes.add(new ResearchGraphDTO.Node(
                            authorNodeId,
                            author.getName(),
                            "Author",
                            author.getPaperCount(),
                            null,
                            author.getOrcid() != null ? "ORCID: " + author.getOrcid() : "Researcher",
                            null
                    ));
                    addedNodeIds.add(authorNodeId);
                }
                if (relFilter.contains("WROTE")) {
                    links.add(new ResearchGraphDTO.Link(authorNodeId, paperNodeId, "WROTE"));
                }
            }

            // Topics & HAS_TOPIC links
            for (TopicDTO topic : paperDTO.getTopics()) {
                topicIds.add(topic.getId());
                String topicNodeId = "topic_" + topic.getId();
                if (!addedNodeIds.contains(topicNodeId)) {
                    nodes.add(new ResearchGraphDTO.Node(
                            topicNodeId,
                            topic.getName(),
                            "Topic",
                            topic.getPaperCount(),
                            null,
                            topic.getCategory() != null ? topic.getCategory() : "Research Area",
                            null
                    ));
                    addedNodeIds.add(topicNodeId);
                }
                if (relFilter.contains("HAS_TOPIC")) {
                    links.add(new ResearchGraphDTO.Link(paperNodeId, topicNodeId, "HAS_TOPIC"));
                }
            }

            paperTopicsMap.put(paperDTO.getId(), topicIds);

            // Institutions & AFFILIATED_WITH links
            for (InstitutionDTO inst : paperDTO.getInstitutions()) {
                String instNodeId = "inst_" + inst.getId();
                if (!addedNodeIds.contains(instNodeId)) {
                    nodes.add(new ResearchGraphDTO.Node(
                            instNodeId,
                            inst.getName(),
                            "Institution",
                            inst.getPaperCount(),
                            null,
                            inst.getCountryCode() != null ? "Country: " + inst.getCountryCode() : "Academic Institution",
                            null
                    ));
                    addedNodeIds.add(instNodeId);
                }
                if (relFilter.contains("AFFILIATED_WITH")) {
                    links.add(new ResearchGraphDTO.Link(paperNodeId, instNodeId, "AFFILIATED_WITH"));
                }
            }
        }

        // Add real CITES links between papers in the graph
        if (relFilter.contains("CITES")) {
            List<String> rawPaperIds = paperDTOs.stream().map(PaperDTO::getId).toList();
            List<PaperReference> references = paperReferenceRepository.findByPaperIdIn(rawPaperIds);
            Set<String> paperIdSet = new HashSet<>(rawPaperIds);

            for (PaperReference ref : references) {
                if (paperIdSet.contains(ref.getReferencedPaperId())) {
                    links.add(new ResearchGraphDTO.Link("paper_" + ref.getPaperId(), "paper_" + ref.getReferencedPaperId(), "CITES"));
                }
            }
        }

        // Add SIMILAR_TOPIC links when papers share 2 or more topics
        if (relFilter.contains("SIMILAR_TOPIC")) {
            List<PaperDTO> pList = paperDTOs;
            for (int i = 0; i < pList.size(); i++) {
                for (int j = i + 1; j < pList.size(); j++) {
                    Set<String> t1 = paperTopicsMap.getOrDefault(pList.get(i).getId(), Collections.emptySet());
                    Set<String> t2 = paperTopicsMap.getOrDefault(pList.get(j).getId(), Collections.emptySet());
                    Set<String> common = new HashSet<>(t1);
                    common.retainAll(t2);
                    if (common.size() >= 2) {
                        links.add(new ResearchGraphDTO.Link("paper_" + pList.get(i).getId(), "paper_" + pList.get(j).getId(), "SIMILAR_TOPIC"));
                    }
                }
            }
        }

        return new ResearchGraphDTO(nodes, links);
    }

    private String truncateTitle(String title) {
        if (title == null) return "";
        return title.length() > 38 ? title.substring(0, 35) + "..." : title;
    }
}
