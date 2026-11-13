package com.hospital.network.dto;

import java.util.List;

/**
 * Request DTO for the Distance Vector routing algorithm.
 * It contains the graph definition (nodes and weighted edges).
 */
public class DistanceVectorRequest {
    private List<GraphNodeDto> nodes;
    private List<EdgeDto> edges;

    public DistanceVectorRequest() {}

    public DistanceVectorRequest(List<GraphNodeDto> nodes, List<EdgeDto> edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    public List<GraphNodeDto> getNodes() {
        return nodes;
    }

    public void setNodes(List<GraphNodeDto> nodes) {
        this.nodes = nodes;
    }

    public List<EdgeDto> getEdges() {
        return edges;
    }

    public void setEdges(List<EdgeDto> edges) {
        this.edges = edges;
    }
}

