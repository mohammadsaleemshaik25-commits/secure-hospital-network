package com.hospital.network.service;

import com.hospital.network.dto.*;
import com.hospital.network.transport.model.UdpStats;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class UdpService {
    private static final Random RANDOM = new Random(12345);
    private final Map<String, UdpStats> statsMap = new ConcurrentHashMap<>();

    public UdpSendResponse send(UdpSendRequest request) {
        validatePort(request.getSrcPort(), "srcPort");
        validatePort(request.getDstPort(), "dstPort");
        String clientId = request.getClientId() != null ? request.getClientId() : "default";
        UdpStats stats = statsMap.computeIfAbsent(clientId, UdpStats::new);
        stats.incrementSent();
        double lossProb = request.getLossProbability() != null ? request.getLossProbability() : 0.0;
        boolean delivered = RANDOM.nextDouble() >= lossProb;
        if (delivered) {
            stats.incrementDelivered();
        } else {
            stats.incrementLost();
        }
        String packetId = UUID.randomUUID().toString();
        return new UdpSendResponse(packetId, delivered);
    }

    public UdpStatsResponse stats(String clientId) {
        if (clientId == null) {
            throw new IllegalArgumentException("clientId must not be null");
        }
        UdpStats stats = statsMap.get(clientId);
        if (stats == null) {
            return new UdpStatsResponse(clientId, 0, 0, 0);
        }
        return new UdpStatsResponse(clientId, stats.getSent(), stats.getDelivered(), stats.getLost());
    }

    private void validatePort(Integer port, String name) {
        if (port == null || port < 1 || port > 65535) {
            throw new IllegalArgumentException(name + " must be between 1 and 65535");
        }
    }
}

