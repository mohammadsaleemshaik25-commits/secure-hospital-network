package com.hospital.network.dto;

public class UdpStatsResponse {
    private String clientId;
    private int sentPackets;
    private int deliveredPackets;
    private int lostPackets;

    public UdpStatsResponse() {}

    public UdpStatsResponse(String clientId, int sentPackets, int deliveredPackets, int lostPackets) {
        this.clientId = clientId;
        this.sentPackets = sentPackets;
        this.deliveredPackets = deliveredPackets;
        this.lostPackets = lostPackets;
    }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public int getSentPackets() { return sentPackets; }
    public void setSentPackets(int sentPackets) { this.sentPackets = sentPackets; }
    public int getDeliveredPackets() { return deliveredPackets; }
    public void setDeliveredPackets(int deliveredPackets) { this.deliveredPackets = deliveredPackets; }
    public int getLostPackets() { return lostPackets; }
    public void setLostPackets(int lostPackets) { this.lostPackets = lostPackets; }
}

