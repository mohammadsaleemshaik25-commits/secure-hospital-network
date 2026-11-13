package com.hospital.network.service;

import com.hospital.network.dto.*;
import com.hospital.network.transport.model.TcpConnection;
import com.hospital.network.transport.model.TcpState;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TcpService {
    private static final Random RANDOM = new Random(12345);
    private static final int DEFAULT_MAX_RETRIES = 3;
    private final Map<UUID, TcpConnection> store = new ConcurrentHashMap<>();

    public TcpConnectResponse connect(TcpConnectRequest request) {
        validatePort(request.getSrcPort(), "srcPort");
        validatePort(request.getDstPort(), "dstPort");
        UUID id = UUID.randomUUID();
        TcpConnection conn = new TcpConnection(id, request.getSrcPort(), request.getDstPort());
        conn.setState(TcpState.SYN_SENT);
        conn.logEvent("SYN");
        // Simulate immediate SYN-ACK
        conn.setState(TcpState.SYN_RECEIVED);
        conn.logEvent("SYN-ACK");
        // Simulate final ACK
        conn.setState(TcpState.ESTABLISHED);
        conn.logEvent("ACK");
        store.put(id, conn);
        return new TcpConnectResponse(id.toString(), conn.getState().name(), conn.getClientSeq(), conn.getServerSeq(), conn.getEventLog());
    }

    public TcpCloseResponse close(TcpCloseRequest request) {
        TcpConnection conn = getConnectionOrThrow(request.getConnectionId());
        if (conn.getState() != TcpState.ESTABLISHED) {
            throw new IllegalArgumentException("Connection not in ESTABLISHED state");
        }
        conn.setState(TcpState.FIN_WAIT_1);
        conn.logEvent("FIN");
        conn.setState(TcpState.CLOSED);
        conn.logEvent("FIN-ACK");
        conn.logEvent("ACK");
        store.remove(conn.getConnectionId());
        return new TcpCloseResponse(conn.getConnectionId().toString(), TcpState.CLOSED.name());
    }

    public TcpDataResponse send(TcpDataRequest request) {
        TcpConnection conn = getConnectionOrThrow(request.getConnectionId());
        if (conn.getState() != TcpState.ESTABLISHED) {
            throw new IllegalArgumentException("Cannot send data on a closed or non‑established connection");
        }
        String payload = Optional.ofNullable(request.getPayload()).orElse("");
        long bytes = payload.getBytes().length;
        int maxRetries = Optional.ofNullable(request.getMaxRetries()).orElse(DEFAULT_MAX_RETRIES);
        double lossProb = Optional.ofNullable(request.getLossProbability()).orElse(0.0);
        boolean lost = false;
        int attempts = 0;
        while (attempts < maxRetries) {
            attempts++;
            if (RANDOM.nextDouble() < lossProb) {
                // simulate loss
                conn.incrementLostPackets();
                conn.incrementRetransmissions();
                lost = true;
                continue; // retry
            }
            // successful transmission
            conn.addClientSeq(bytes);
            conn.addBytesSent(bytes);
            conn.logEvent("DATA seq=" + conn.getClientSeq());
            lost = false;
            break;
        }
        boolean retransmissionRequired = lost;
        long ackNumber = conn.getClientSeq();
        return new TcpDataResponse(ackNumber, retransmissionRequired, conn.getBytesSent());
    }

    public TcpStatusResponse status(String connectionId) {
        TcpConnection conn = getConnectionOrThrow(connectionId);
        return new TcpStatusResponse(
                conn.getState().name(),
                conn.getBytesSent(),
                conn.getBytesReceived(),
                conn.getLostPackets(),
                conn.getRetransmissions()
        );
    }

    private TcpConnection getConnectionOrThrow(String id) {
        if (id == null) {
            throw new IllegalArgumentException("connectionId must not be null");
        }
        UUID uuid;
        try {
            uuid = UUID.fromString(id);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid connectionId format");
        }
        TcpConnection conn = store.get(uuid);
        if (conn == null) {
            throw new IllegalArgumentException("Unknown connectionId");
        }
        return conn;
    }

    private void validatePort(Integer port, String name) {
        if (port == null || port < 1 || port > 65535) {
            throw new IllegalArgumentException(name + " must be between 1 and 65535");
        }
    }
}

