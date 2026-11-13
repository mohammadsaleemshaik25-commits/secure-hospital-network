package com.hospital.network.service;

import com.hospital.network.dto.DistanceVectorRequest;
import com.hospital.network.dto.DistanceVectorResponse;
import com.hospital.network.dto.EdgeDto;
import com.hospital.network.dto.GraphNodeDto;
import com.hospital.network.dto.RoutingEntry;
import com.hospital.network.dto.RoutingTableDto;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class DistanceVectorServiceTest {

    private final DistanceVectorService service = new DistanceVectorService();

    private DistanceVectorRequest buildRequest(List<GraphNodeDto> nodes, List<EdgeDto> edges) {
        return new DistanceVectorRequest(nodes, edges);
    }

    private GraphNodeDto node(String id) {
        return new GraphNodeDto(id);
    }

    private EdgeDto edge(String src, String tgt, int weight) {
        EdgeDto e = new EdgeDto();
        e.setSource(src);
        e.setTarget(tgt);
        e.setWeight(weight);
        return e;
    }

    @Test
    void twoConnectedNodes() {
        List<GraphNodeDto> nodes = List.of(node("A"), node("B"));
        List<EdgeDto> edges = List.of(edge("A", "B", 1), edge("B", "A", 1));
        DistanceVectorResponse resp = service.calculateDistanceVector(buildRequest(nodes, edges));
        // Expect each node to have a direct entry to the other with cost 1
        RoutingTableDto aTable = resp.getRoutingTables().stream()
                .filter(t -> t.getNodeId().equals("A"))
                .findFirst().orElseThrow();
        RoutingEntry aToB = aTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("B"))
                .findFirst().orElseThrow();
        assertThat(aToB.getTotalCost()).isEqualTo(1);
        assertThat(aToB.getNextHop()).isEqualTo("B");

        RoutingTableDto bTable = resp.getRoutingTables().stream()
                .filter(t -> t.getNodeId().equals("B"))
                .findFirst().orElseThrow();
        RoutingEntry bToA = bTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("A"))
                .findFirst().orElseThrow();
        assertThat(bToA.getTotalCost()).isEqualTo(1);
        assertThat(bToA.getNextHop()).isEqualTo("A");
    }

    @Test
    void sampleGraphBidirectional() {
        List<GraphNodeDto> nodes = List.of(node("A"), node("B"), node("C"));
        // edges defined only one direction; service will add reverse automatically
        List<EdgeDto> edges = List.of(
                edge("A", "B", 5),
                edge("B", "C", 3),
                edge("A", "C", 10)
        );
        DistanceVectorResponse resp = service.calculateDistanceVector(buildRequest(nodes, edges));
        // verify each routing table
        RoutingTableDto aTable = resp.getRoutingTables().stream()
                .filter(t -> t.getNodeId().equals("A"))
                .findFirst().orElseThrow();
        RoutingEntry aToB = aTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("B"))
                .findFirst().orElseThrow();
        RoutingEntry aToC = aTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("C"))
                .findFirst().orElseThrow();
        assertThat(aToB.getTotalCost()).isEqualTo(5);
        assertThat(aToB.getNextHop()).isEqualTo("B");
        // shortest A->C via B = 5+3 = 8
        assertThat(aToC.getTotalCost()).isEqualTo(8);
        assertThat(aToC.getNextHop()).isEqualTo("B");

        RoutingTableDto bTable = resp.getRoutingTables().stream()
                .filter(t -> t.getNodeId().equals("B"))
                .findFirst().orElseThrow();
        RoutingEntry bToA = bTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("A"))
                .findFirst().orElseThrow();
        RoutingEntry bToC = bTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("C"))
                .findFirst().orElseThrow();
        assertThat(bToA.getTotalCost()).isEqualTo(5);
        assertThat(bToA.getNextHop()).isEqualTo("A");
        assertThat(bToC.getTotalCost()).isEqualTo(3);
        assertThat(bToC.getNextHop()).isEqualTo("C");

        RoutingTableDto cTable = resp.getRoutingTables().stream()
                .filter(t -> t.getNodeId().equals("C"))
                .findFirst().orElseThrow();
        RoutingEntry cToA = cTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("A"))
                .findFirst().orElseThrow();
        RoutingEntry cToB = cTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("B"))
                .findFirst().orElseThrow();
        // C->A via B = 3+5 = 8
        assertThat(cToA.getTotalCost()).isEqualTo(8);
        assertThat(cToA.getNextHop()).isEqualTo("B");
        assertThat(cToB.getTotalCost()).isEqualTo(3);
        assertThat(cToB.getNextHop()).isEqualTo("B");
    }
    @Test
    void triangleNetwork() {
        List<GraphNodeDto> nodes = List.of(node("A"), node("B"), node("C"));
        List<EdgeDto> edges = List.of(
                edge("A", "B", 2), edge("B", "A", 2),
                edge("B", "C", 2), edge("C", "B", 2),
                edge("A", "C", 5), edge("C", "A", 5)
        );
        DistanceVectorResponse resp = service.calculateDistanceVector(buildRequest(nodes, edges));
        // A should reach C via B with total cost 4, not directly with cost 5
        RoutingTableDto aTable = resp.getRoutingTables().stream()
                .filter(t -> t.getNodeId().equals("A"))
                .findFirst().orElseThrow();
        RoutingEntry aToC = aTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("C"))
                .findFirst().orElseThrow();
        assertThat(aToC.getTotalCost()).isEqualTo(4);
        assertThat(aToC.getNextHop()).isEqualTo("B");
    }

    @Test
    void disconnectedTarget() {
        List<GraphNodeDto> nodes = List.of(node("A"), node("B"), node("C"));
        List<EdgeDto> edges = List.of(edge("A", "B", 1), edge("B", "A", 1)); // C isolated
        DistanceVectorResponse resp = service.calculateDistanceVector(buildRequest(nodes, edges));
        RoutingTableDto aTable = resp.getRoutingTables().stream()
                .filter(t -> t.getNodeId().equals("A"))
                .findFirst().orElseThrow();
        RoutingEntry aToC = aTable.getEntries().stream()
                .filter(e -> e.getDestination().equals("C"))
                .findFirst().orElseThrow();
        assertThat(aToC.getTotalCost()).isEqualTo(-1);
        assertThat(aToC.getNextHop()).isNull();
    }

    @Test
    void invalidSourceOrTarget() {
        List<GraphNodeDto> nodes = List.of(node("A"), node("B"));
        List<EdgeDto> edges = List.of(edge("A", "B", 1));
        // request with an edge referencing unknown node
        DistanceVectorRequest badRequest = new DistanceVectorRequest(
                List.of(node("A"), node("B")),
                List.of(edge("A", "X", 1)));
        assertThatThrownBy(() -> service.calculateDistanceVector(badRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Edge references unknown node");    }

    @Test
    void negativeEdgeWeightRejected() {
        List<GraphNodeDto> nodes = List.of(node("A"), node("B"));
        List<EdgeDto> edges = List.of(edge("A", "B", -1));
        DistanceVectorRequest request = buildRequest(nodes, edges);
        assertThatThrownBy(() -> service.calculateDistanceVector(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Negative edge weight");
    }
}
