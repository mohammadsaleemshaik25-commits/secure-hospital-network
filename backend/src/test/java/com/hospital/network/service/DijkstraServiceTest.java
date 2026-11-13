package com.hospital.network.service;

import com.hospital.network.dto.EdgeDto;
import com.hospital.network.dto.GraphNodeDto;
import com.hospital.network.dto.ShortestPathRequest;
import com.hospital.network.dto.ShortestPathResponse;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

/**
 * Tests for {@link DijkstraService} covering the required scenarios.
 */
class DijkstraServiceTest {

    private final DijkstraService service = new DijkstraService();

    private ShortestPathRequest buildRequest(List<GraphNodeDto> nodes, List<EdgeDto> edges,
                                              String source, String target) {
        ShortestPathRequest req = new ShortestPathRequest();
        req.setNodes(nodes);
        req.setEdges(edges);
        req.setSourceId(source);
        req.setTargetId(target);
        return req;
    }

    @Test
    void shortestPath_lineGraph() {
        // Graph: A -1-> B -1-> C -1-> D
        List<GraphNodeDto> nodes = List.of(
                new GraphNodeDto("A"), new GraphNodeDto("B"),
                new GraphNodeDto("C"), new GraphNodeDto("D"));
        List<EdgeDto> edges = List.of(
                new EdgeDto("A", "B", 1),
                new EdgeDto("B", "C", 1),
                new EdgeDto("C", "D", 1));
        ShortestPathRequest req = buildRequest(nodes, edges, "A", "D");
        ShortestPathResponse resp = service.calculateShortestPath(req);
        assertThat(resp.getPath()).containsExactly("A", "B", "C", "D");
        assertThat(resp.getTotalCost()).isEqualTo(3);
    }

    @Test
    void shortestPath_branchingGraphNonOptimalDirectRoute() {
        // Graph:
        // A -5-> D (direct, expensive)
        // A -1-> B -1-> C -1-> D (cheaper)
        List<GraphNodeDto> nodes = List.of(
                new GraphNodeDto("A"), new GraphNodeDto("B"),
                new GraphNodeDto("C"), new GraphNodeDto("D"));
        List<EdgeDto> edges = List.of(
                new EdgeDto("A", "D", 5),
                new EdgeDto("A", "B", 1),
                new EdgeDto("B", "C", 1),
                new EdgeDto("C", "D", 1));
        ShortestPathRequest req = buildRequest(nodes, edges, "A", "D");
        ShortestPathResponse resp = service.calculateShortestPath(req);
        // Expected path A -> B -> C -> D with total cost 3, not the direct A->D.
        assertThat(resp.getPath()).containsExactly("A", "B", "C", "D");
        assertThat(resp.getTotalCost()).isEqualTo(3);
    }

    @Test
    void shortestPath_disconnectedTarget() {
        // Graph: A -1-> B   (C is isolated)
        List<GraphNodeDto> nodes = List.of(
                new GraphNodeDto("A"), new GraphNodeDto("B"), new GraphNodeDto("C"));
        List<EdgeDto> edges = List.of(
                new EdgeDto("A", "B", 1));
        ShortestPathRequest req = buildRequest(nodes, edges, "A", "C");
        ShortestPathResponse resp = service.calculateShortestPath(req);
        assertThat(resp.getPath()).isEmpty();
        assertThat(resp.getTotalCost()).isEqualTo(-1);
    }

    @Test
    void shortestPath_invalidSourceOrTargetRejected() {
        List<GraphNodeDto> nodes = List.of(new GraphNodeDto("A"), new GraphNodeDto("B"));
        List<EdgeDto> edges = List.of(new EdgeDto("A", "B", 1));
        // source not present
        ShortestPathRequest badSource = buildRequest(nodes, edges, "X", "B");
        // target not present
        ShortestPathRequest badTarget = buildRequest(nodes, edges, "A", "Y");
        assertThatThrownBy(() -> service.calculateShortestPath(badSource))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Source node not found");
        assertThatThrownBy(() -> service.calculateShortestPath(badTarget))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Target node not found");
    }

    @Test
    void shortestPath_negativeEdgeWeightRejected() {
        List<GraphNodeDto> nodes = List.of(new GraphNodeDto("A"), new GraphNodeDto("B"));
        List<EdgeDto> edges = List.of(new EdgeDto("A", "B", -1)); // illegal weight
        ShortestPathRequest req = buildRequest(nodes, edges, "A", "B");
        assertThatThrownBy(() -> service.calculateShortestPath(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Negative edge weight");
    }
}

