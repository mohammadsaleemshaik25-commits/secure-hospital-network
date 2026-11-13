package com.hospital.network.service;

import com.hospital.network.dto.EdgeDto;
import com.hospital.network.dto.GraphNodeDto;
import com.hospital.network.dto.DistanceVectorRequest;
import com.hospital.network.dto.DistanceVectorResponse;
import com.hospital.network.dto.RoutingEntry;
import com.hospital.network.dto.RoutingTableDto;
import com.hospital.network.dto.ErrorResponse;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service that computes distance‑vector routing tables for a given graph.
 * Implements the classic Bellman‑Ford style iterative update until convergence
 * (or a safe iteration limit to avoid infinite loops).
 */
@Service
public class DistanceVectorService {

    private static final int INF = Integer.MAX_VALUE / 2; // avoid overflow
    private static final int MAX_ITERATIONS = 100; // safe convergence guard

    public DistanceVectorResponse calculateDistanceVector(DistanceVectorRequest request) {
        // Basic validation – same as DijkstraService
        if (request == null || request.getNodes() == null || request.getEdges() == null) {
            throw new IllegalArgumentException("Request fields must not be null");
        }

        Set<String> nodeIds = new HashSet<>();
        for (GraphNodeDto node : request.getNodes()) {
            if (node == null || node.getId() == null) {
                throw new IllegalArgumentException("Node ids must not be null");
            }
            nodeIds.add(node.getId());
        }

        // Build adjacency list and validate edges
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
            // add forward edge
            adjacency.get(edge.getSource()).add(edge);
            // add reverse edge for undirected graph, avoid self‑loop and duplicate reverse
            if (!edge.getSource().equals(edge.getTarget())) {
                boolean reverseExists = adjacency.get(edge.getTarget()).stream()
                    .anyMatch(e -> e.getSource().equals(edge.getTarget()) && e.getTarget().equals(edge.getSource()) && e.getWeight() == edge.getWeight());
                if (!reverseExists) {
                    adjacency.get(edge.getTarget()).add(new EdgeDto(edge.getTarget(), edge.getSource(), edge.getWeight()));
                }
            }
        }

        // Initialise distance vectors for each node
        // distances[node][dest] = cost; nextHop[node][dest] = next hop id (null if unreachable)
        Map<String, Map<String, Integer>> cost = new HashMap<>();
        Map<String, Map<String, String>> nextHop = new HashMap<>();
        for (String id : nodeIds) {
            Map<String, Integer> costMap = new HashMap<>();
            Map<String, String> nextMap = new HashMap<>();
            for (String dest : nodeIds) {
                if (id.equals(dest)) {
                    costMap.put(dest, 0);
                    nextMap.put(dest, null);
                } else {
                    costMap.put(dest, INF);
                    nextMap.put(dest, null);
                }
            }
            // direct neighbours initialise
            for (EdgeDto e : adjacency.get(id)) {
                costMap.put(e.getTarget(), e.getWeight());
                nextMap.put(e.getTarget(), e.getTarget());
            }
            cost.put(id, costMap);
            nextHop.put(id, nextMap);
        }

        // Iterative updates
        boolean updated;
        int iteration = 0;
        do {
            updated = false;
            iteration++;
            for (String node : nodeIds) {
                Map<String, Integer> nodeCost = cost.get(node);
                Map<String, String> nodeNext = nextHop.get(node);
                // Examine each neighbour
                for (EdgeDto edge : adjacency.get(node)) {
                    String neighbour = edge.getTarget(); // adjacency list stores edges with current node as source
                    // Use the neighbour's current vector
                    Map<String, Integer> neighbourCost = cost.get(neighbour);
                    for (String dest : nodeIds) {
                        int viaCost = edge.getWeight() + neighbourCost.get(dest);
                        if (viaCost < nodeCost.get(dest)) {
                            nodeCost.put(dest, viaCost);
                            // next hop is neighbour if dest not neighbour itself
                            nodeNext.put(dest, neighbour);
                            updated = true;
                        }
                    }
                }
            }
        } while (updated && iteration < MAX_ITERATIONS);

        // Build response tables
        List<RoutingTableDto> tables = new ArrayList<>();
        for (String node : nodeIds) {
            List<RoutingEntry> entries = new ArrayList<>();
            for (String dest : nodeIds) {
                int c = cost.get(node).get(dest);
                int totalCost = (c >= INF) ? -1 : c;
                String hop = (totalCost == -1 || node.equals(dest)) ? null : nextHop.get(node).get(dest);
                entries.add(new RoutingEntry(dest, hop, totalCost));
            }
            tables.add(new RoutingTableDto(node, entries));
        }
        return new DistanceVectorResponse(tables);
    }
}

