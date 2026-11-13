package com.hospital.network.dto;

/**
 * DTO representing a node in the graph.
 * Currently only an identifier is required; additional metadata (label, etc.) can be added later.
 */
public class GraphNodeDto {
    private String id;

    public GraphNodeDto() {}

    public GraphNodeDto(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}

