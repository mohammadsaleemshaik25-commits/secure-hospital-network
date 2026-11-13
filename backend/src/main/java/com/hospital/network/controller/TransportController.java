package com.hospital.network.controller;

import com.hospital.network.dto.*;
import com.hospital.network.service.TcpService;
import com.hospital.network.service.UdpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TcpService tcpService;
    private final UdpService udpService;

    public TransportController(TcpService tcpService, UdpService udpService) {
        this.tcpService = tcpService;
        this.udpService = udpService;
    }

    // ---------- TCP ----------
    @PostMapping("/tcp/connect")
    public ResponseEntity<TcpConnectResponse> tcpConnect(@RequestBody TcpConnectRequest request) {
        try {
            return ResponseEntity.ok(tcpService.connect(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/tcp/close")
    public ResponseEntity<TcpCloseResponse> tcpClose(@RequestBody TcpCloseRequest request) {
        try {
            return ResponseEntity.ok(tcpService.close(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/tcp/send")
    public ResponseEntity<TcpDataResponse> tcpSend(@RequestBody TcpDataRequest request) {
        try {
            return ResponseEntity.ok(tcpService.send(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/tcp/status/{connectionId}")
    public ResponseEntity<TcpStatusResponse> tcpStatus(@PathVariable("connectionId") String connectionId) {
        try {
            return ResponseEntity.ok(tcpService.status(connectionId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // ---------- UDP ----------
    @PostMapping("/udp/send")
    public ResponseEntity<UdpSendResponse> udpSend(@RequestBody UdpSendRequest request) {
        try {
            return ResponseEntity.ok(udpService.send(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/udp/stats/{clientId}")
    public ResponseEntity<UdpStatsResponse> udpStats(@PathVariable("clientId") String clientId) {
        try {
            return ResponseEntity.ok(udpService.stats(clientId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}

