package com.hospital.network.dto;

import java.util.List;

/**
 * Response DTO for the Distance Vector routing algorithm.
 * Contains a routing table for each node in the graph.
 */
public class DistanceVectorResponse {
    private List<RoutingTableDto> routingTables;

    public DistanceVectorResponse() {}

    public DistanceVectorResponse(List<RoutingTableDto> routingTables) {
        this.routingTables = routingTables;
    }

    public List<RoutingTableDto> getRoutingTables() {
        return routingTables;
    }

    public void setRoutingTables(List<RoutingTableDto> routingTables) {
        this.routingTables = routingTables;
    }
}

