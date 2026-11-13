package com.hospital.network.controller;

import com.hospital.network.dto.ErrorResponse;
import com.hospital.network.dto.ShortestPathRequest;
import com.hospital.network.dto.ShortestPathResponse;
import com.hospital.network.dto.DistanceVectorRequest;
import com.hospital.network.dto.DistanceVectorResponse;
import com.hospital.network.service.DistanceVectorService;
import com.hospital.network.dto.ShortestPathResponse;
import com.hospital.network.service.DijkstraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller exposing routing algorithms.
 */
@RestController
@RequestMapping("/api/routing")
public class RoutingController {

    private final DijkstraService dijkstraService;
    private final DistanceVectorService distanceVectorService;

    public RoutingController(DijkstraService dijkstraService, DistanceVectorService distanceVectorService) {
        this.dijkstraService = dijkstraService;
        this.distanceVectorService = distanceVectorService;
    }

        @PostMapping("/distance-vector")
    public ResponseEntity<?> distanceVector(@RequestBody DistanceVectorRequest request) {
        try {
            DistanceVectorResponse response = distanceVectorService.calculateDistanceVector(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/dijkstra")
    public ResponseEntity<?> dijkstra(@RequestBody ShortestPathRequest request) {
        try {
            ShortestPathResponse response = dijkstraService.calculateShortestPath(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
}

