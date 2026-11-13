package com.hospital.network.dto;

import java.util.List;

/**
 * Request DTO for Dijkstra shortest‑path calculation.
 */
public class ShortestPathRequest {
    private List<GraphNodeDto> nodes;
    private List<EdgeDto> edges;
    private String sourceId;
    private String targetId;

    public ShortestPathRequest() {}

    public ShortestPathRequest(List<GraphNodeDto> nodes, List<EdgeDto> edges, String sourceId, String targetId) {
        this.nodes = nodes;
        this.edges = edges;
        this.sourceId = sourceId;
        this.targetId = targetId;
    }

    public List<GraphNodeDto> getNodes() { return nodes; }
    public void setNodes(List<GraphNodeDto> nodes) { this.nodes = nodes; }
    public List<EdgeDto> getEdges() { return edges; }
    public void setEdges(List<EdgeDto> edges) { this.edges = edges; }
    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
}

