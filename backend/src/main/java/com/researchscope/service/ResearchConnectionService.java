package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.InstitutionDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.ResearchGraphDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.Paper;
import com.researchscope.repository.PaperRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ResearchConnectionService {

    private final PaperRepository paperRepository;
    private final PaperService paperService;

    public ResearchConnectionService(PaperRepository paperRepository, PaperService paperService) {
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }

    public ResearchGraphDTO getResearchGraph(String query, int limit) {
        List<Paper> papers = paperRepository.findTopCitedPapers(PageRequest.of(0, Math.min(limit, 20)));
        List<ResearchGraphDTO.Node> nodes = new ArrayList<>();
        List<ResearchGraphDTO.Link> links = new ArrayList<>();
        Set<String> addedNodeIds = new HashSet<>();

        for (Paper p : papers) {
            PaperDTO paperDTO = paperService.toPaperDTO(p);

            // Paper Node
            String paperNodeId = "paper_" + paperDTO.getId();
            if (!addedNodeIds.contains(paperNodeId)) {
                nodes.add(new ResearchGraphDTO.Node(paperNodeId, truncateTitle(paperDTO.getTitle()), "Paper", paperDTO.getCitationCount()));
                addedNodeIds.add(paperNodeId);
            }

            // Author Nodes & Links
            for (AuthorDTO author : paperDTO.getAuthors()) {
                String authorNodeId = "author_" + author.getId();
                if (!addedNodeIds.contains(authorNodeId)) {
                    nodes.add(new ResearchGraphDTO.Node(authorNodeId, author.getName(), "Author", author.getPaperCount()));
                    addedNodeIds.add(authorNodeId);
                }
                links.add(new ResearchGraphDTO.Link(authorNodeId, paperNodeId, "WROTE"));
            }

            // Topic Nodes & Links
            for (TopicDTO topic : paperDTO.getTopics()) {
                String topicNodeId = "topic_" + topic.getId();
                if (!addedNodeIds.contains(topicNodeId)) {
                    nodes.add(new ResearchGraphDTO.Node(topicNodeId, topic.getName(), "Topic", topic.getPaperCount()));
                    addedNodeIds.add(topicNodeId);
                }
                links.add(new ResearchGraphDTO.Link(paperNodeId, topicNodeId, "HAS_TOPIC"));
            }

            // Institution Nodes & Links
            for (InstitutionDTO inst : paperDTO.getInstitutions()) {
                String instNodeId = "inst_" + inst.getId();
                if (!addedNodeIds.contains(instNodeId)) {
                    nodes.add(new ResearchGraphDTO.Node(instNodeId, inst.getName(), "Institution", inst.getPaperCount()));
                    addedNodeIds.add(instNodeId);
                }
                links.add(new ResearchGraphDTO.Link(paperNodeId, instNodeId, "AFFILIATED_WITH"));
            }
        }

        return new ResearchGraphDTO(nodes, links);
    }

    private String truncateTitle(String title) {
        if (title == null) return "";
        return title.length() > 35 ? title.substring(0, 32) + "..." : title;
    }
}
