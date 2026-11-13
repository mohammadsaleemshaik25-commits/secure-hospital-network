package com.hospital.network.dto;

import java.util.List;

/**
 * Response DTO for Dijkstra shortest‑path calculation.
 */
public class ShortestPathResponse {
    private List<String> path; // ordered list of node ids from source to target
    private int totalCost; // -1 if target unreachable

    public ShortestPathResponse() {}

    public ShortestPathResponse(List<String> path, int totalCost) {
        this.path = path;
        this.totalCost = totalCost;
    }

    public List<String> getPath() { return path; }
    public void setPath(List<String> path) { this.path = path; }
    public int getTotalCost() { return totalCost; }
    public void setTotalCost(int totalCost) { this.totalCost = totalCost; }
}

