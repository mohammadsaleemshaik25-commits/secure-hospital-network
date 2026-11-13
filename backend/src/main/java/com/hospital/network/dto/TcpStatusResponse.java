package com.hospital.network.dto;

public class TcpStatusResponse {
    private String state;
    private long sentBytes;
    private long receivedBytes;
    private int lostPackets;
    private int retransmissions;

    public TcpStatusResponse() {}

    public TcpStatusResponse(String state, long sentBytes, long receivedBytes, int lostPackets, int retransmissions) {
        this.state = state;
        this.sentBytes = sentBytes;
        this.receivedBytes = receivedBytes;
        this.lostPackets = lostPackets;
        this.retransmissions = retransmissions;
    }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public long getSentBytes() { return sentBytes; }
    public void setSentBytes(long sentBytes) { this.sentBytes = sentBytes; }
    public long getReceivedBytes() { return receivedBytes; }
    public void setReceivedBytes(long receivedBytes) { this.receivedBytes = receivedBytes; }
    public int getLostPackets() { return lostPackets; }
    public void setLostPackets(int lostPackets) { this.lostPackets = lostPackets; }
    public int getRetransmissions() { return retransmissions; }
    public void setRetransmissions(int retransmissions) { this.retransmissions = retransmissions; }
}

