package com.hospital.network.transport.model;

import java.util.concurrent.atomic.AtomicInteger;

public class UdpStats {
    private final String clientId;
    private final AtomicInteger sent = new AtomicInteger(0);
    private final AtomicInteger delivered = new AtomicInteger(0);
    private final AtomicInteger lost = new AtomicInteger(0);

    public UdpStats(String clientId) {
        this.clientId = clientId;
    }

    public String getClientId() { return clientId; }
    public int getSent() { return sent.get(); }
    public int getDelivered() { return delivered.get(); }
    public int getLost() { return lost.get(); }
    public void incrementSent() { sent.incrementAndGet(); }
    public void incrementDelivered() { delivered.incrementAndGet(); }
    public void incrementLost() { lost.incrementAndGet(); }
}

