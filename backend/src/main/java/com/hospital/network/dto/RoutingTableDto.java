package com.hospital.network.dto;

import java.util.List;

/**
 * Holds the routing table for a single node.
 */
public class RoutingTableDto {
    private String nodeId;
    private List<RoutingEntry> entries;

    public RoutingTableDto() {}

    public RoutingTableDto(String nodeId, List<RoutingEntry> entries) {
        this.nodeId = nodeId;
        this.entries = entries;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public List<RoutingEntry> getEntries() {
        return entries;
    }

    public void setEntries(List<RoutingEntry> entries) {
        this.entries = entries;
    }
}

