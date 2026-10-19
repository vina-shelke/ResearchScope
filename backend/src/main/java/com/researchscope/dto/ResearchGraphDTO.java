package com.researchscope.dto;

import java.util.ArrayList;
import java.util.List;

public class ResearchGraphDTO {

    public static class Node {
        private String id;
        private String label;
        private String type; // Paper, Author, Institution, Topic
        private Integer value; // Citation count or Paper count
        private Integer year;
        private String detail;
        private String doi;

        public Node() {}

        public Node(String id, String label, String type, Integer value) {
            this(id, label, type, value, null, null, null);
        }

        public Node(String id, String label, String type, Integer value, Integer year, String detail, String doi) {
            this.id = id;
            this.label = label;
            this.type = type;
            this.value = value;
            this.year = year;
            this.detail = detail;
            this.doi = doi;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Integer getValue() { return value; }
        public void setValue(Integer value) { this.value = value; }

        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }

        public String getDetail() { return detail; }
        public void setDetail(String detail) { this.detail = detail; }

        public String getDoi() { return doi; }
        public void setDoi(String doi) { this.doi = doi; }
    }

    public static class Link {
        private String source;
        private String target;
        private String relationship; // WROTE, HAS_TOPIC, AFFILIATED_WITH, CITES, SIMILAR_TOPIC

        public Link() {}
        public Link(String source, String target, String relationship) {
            this.source = source;
            this.target = target;
            this.relationship = relationship;
        }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
    }

    private List<Node> nodes = new ArrayList<>();
    private List<Link> links = new ArrayList<>();

    public ResearchGraphDTO() {}
    public ResearchGraphDTO(List<Node> nodes, List<Link> links) {
        this.nodes = nodes;
        this.links = links;
    }

    public List<Node> getNodes() { return nodes; }
    public void setNodes(List<Node> nodes) { this.nodes = nodes; }

    public List<Link> getLinks() { return links; }
    public void setLinks(List<Link> links) { this.links = links; }
}
