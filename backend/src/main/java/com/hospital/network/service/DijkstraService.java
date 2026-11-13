package com.hospital.network.service;

import com.hospital.network.dto.EdgeDto;
import com.hospital.network.dto.GraphNodeDto;
import com.hospital.network.dto.ShortestPathRequest;
import com.hospital.network.dto.ShortestPathResponse;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service that computes the shortest path between two nodes using Dijkstra's algorithm.
 * It validates the input graph (no negative weights) and returns an empty path with
 * totalCost = -1 when the target is unreachable.
 */
@Service
public class DijkstraService {

    public ShortestPathResponse calculateShortestPath(ShortestPathRequest request) {
        // Basic validation of request fields
        if (request == null || request.getNodes() == null || request.getEdges() == null
                || request.getSourceId() == null || request.getTargetId() == null) {
            throw new IllegalArgumentException("Request fields must not be null");
        }

        Set<String> nodeIds = new HashSet<>();
        for (GraphNodeDto node : request.getNodes()) {
            if (node == null || node.getId() == null) {
                throw new IllegalArgumentException("Node ids must not be null");
            }
            nodeIds.add(node.getId());
        }

        if (!nodeIds.contains(request.getSourceId())) {
            throw new IllegalArgumentException("Source node not found in graph");
        }
        if (!nodeIds.contains(request.getTargetId())) {
            throw new IllegalArgumentException("Target node not found in graph");
        }

        // Build adjacency list and validate edge weights
        Map<String, List<EdgeDto>> adjacency = new HashMap<>();
        for (String id : nodeIds) {
            adjacency.put(id, new ArrayList<>());
        }
        for (EdgeDto edge : request.getEdges()) {
            if (edge == null || edge.getSource() == null || edge.getTarget() == null) {
                throw new IllegalArgumentException("Edge fields must not be null");
            }
            if (!nodeIds.contains(edge.getSource()) || !nodeIds.contains(edge.getTarget())) {
                throw new IllegalArgumentException("Edge references unknown node");
            }
            if (edge.getWeight() < 0) {
                throw new IllegalArgumentException("Negative edge weight is not allowed");
            }
            adjacency.get(edge.getSource()).add(edge);
        }

        // Dijkstra's algorithm
        Map<String, Integer> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();
        for (String id : nodeIds) {
            dist.put(id, Integer.MAX_VALUE);
        }
        dist.put(request.getSourceId(), 0);

        PriorityQueue<String> pq = new PriorityQueue<>(Comparator.comparingInt(dist::get));
        pq.add(request.getSourceId());

        while (!pq.isEmpty()) {
            String u = pq.poll();
            int currentDist = dist.get(u);
            if (currentDist == Integer.MAX_VALUE) {
                break; // Remaining vertices are unreachable
            }
            for (EdgeDto e : adjacency.get(u)) {
                String v = e.getTarget();
                int alt = currentDist + e.getWeight();
                if (alt < dist.get(v)) {
                    dist.put(v, alt);
                    prev.put(v, u);
                    pq.remove(v); // remove if present to re‑insert with new priority
                    pq.add(v);
                }
            }
        }

        // Build path if reachable
        List<String> path = new ArrayList<>();
        int totalCost = dist.get(request.getTargetId());
        if (totalCost != Integer.MAX_VALUE) {
            // reconstruct backwards
            String cur = request.getTargetId();
            while (cur != null) {
                path.add(0, cur);
                cur = prev.get(cur);
            }
        } else {
            // unreachable
            totalCost = -1;
        }

        return new ShortestPathResponse(path, totalCost);
    }
}

