package com.hospital.network.transport.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TcpConnection {
    private final UUID connectionId;
    private final int srcPort;
    private final int dstPort;
    private volatile TcpState state;
    private final AtomicLong clientSeq = new AtomicLong(0);
    private final AtomicLong serverSeq = new AtomicLong(0);
    private final AtomicLong bytesSent = new AtomicLong(0);
    private final AtomicLong bytesReceived = new AtomicLong(0);
    private final AtomicInteger lostPackets = new AtomicInteger(0);
    private final AtomicInteger retransmissions = new AtomicInteger(0);
    private final List<String> eventLog = new ArrayList<>();

    public TcpConnection(UUID connectionId, int srcPort, int dstPort) {
        this.connectionId = connectionId;
        this.srcPort = srcPort;
        this.dstPort = dstPort;
        this.state = TcpState.CLOSED;
    }

    public UUID getConnectionId() { return connectionId; }
    public int getSrcPort() { return srcPort; }
    public int getDstPort() { return dstPort; }
    public TcpState getState() { return state; }
    public void setState(TcpState state) { this.state = state; }
    public long getClientSeq() { return clientSeq.get(); }
    public void addClientSeq(long delta) { clientSeq.addAndGet(delta); }
    public long getServerSeq() { return serverSeq.get(); }
    public void addServerSeq(long delta) { serverSeq.addAndGet(delta); }
    public long getBytesSent() { return bytesSent.get(); }
    public void addBytesSent(long delta) { bytesSent.addAndGet(delta); }
    public long getBytesReceived() { return bytesReceived.get(); }
    public void addBytesReceived(long delta) { bytesReceived.addAndGet(delta); }
    public int getLostPackets() { return lostPackets.get(); }
    public void incrementLostPackets() { lostPackets.incrementAndGet(); }
    public int getRetransmissions() { return retransmissions.get(); }
    public void incrementRetransmissions() { retransmissions.incrementAndGet(); }
    public List<String> getEventLog() { return eventLog; }
    public void logEvent(String e) { eventLog.add(e); }
}

