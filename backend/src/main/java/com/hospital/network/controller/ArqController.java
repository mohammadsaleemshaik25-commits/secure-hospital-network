package com.hospital.network.controller;

import com.hospital.network.dto.ErrorResponse;
import com.hospital.network.dto.GoBackNRequest;
import com.hospital.network.dto.GoBackNResponse;
import com.hospital.network.dto.SlidingWindowRequest;
import com.hospital.network.dto.SlidingWindowResponse;
import com.hospital.network.service.GoBackNService;
import com.hospital.network.service.SlidingWindowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller exposing ARQ simulation endpoints.
 *
 * Endpoints:
 *   POST /api/arq/sliding-window/simulate
 *   POST /api/arq/go-back-n/simulate
 */
@RestController
@RequestMapping("/api/arq")
public class ArqController {

    private final SlidingWindowService slidingWindowService;
    private final GoBackNService goBackNService;

    public ArqController(SlidingWindowService slidingWindowService, GoBackNService goBackNService) {
        this.slidingWindowService = slidingWindowService;
        this.goBackNService = goBackNService;
    }

    @PostMapping("/sliding-window/simulate")
    public ResponseEntity<?> simulateSlidingWindow(@RequestBody SlidingWindowRequest request) {
        try {
            SlidingWindowResponse response = slidingWindowService.simulate(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/go-back-n/simulate")
    public ResponseEntity<?> simulateGoBackN(@RequestBody GoBackNRequest request) {
        try {
            GoBackNResponse response = goBackNService.simulate(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
}

