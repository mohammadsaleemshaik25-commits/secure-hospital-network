package com.hospital.network.dto;

public class UdpSendRequest {
    private Integer srcPort;
    private Integer dstPort;
    private String payload;
    private Double lossProbability; // optional 0..1
    private String clientId; // optional identifier for stats

    public UdpSendRequest() {}

    public UdpSendRequest(Integer srcPort, Integer dstPort, String payload, Double lossProbability, String clientId) {
        this.srcPort = srcPort;
        this.dstPort = dstPort;
        this.payload = payload;
        this.lossProbability = lossProbability;
        this.clientId = clientId;
    }

    public Integer getSrcPort() { return srcPort; }
    public void setSrcPort(Integer srcPort) { this.srcPort = srcPort; }
    public Integer getDstPort() { return dstPort; }
    public void setDstPort(Integer dstPort) { this.dstPort = dstPort; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public Double getLossProbability() { return lossProbability; }
    public void setLossProbability(Double lossProbability) { this.lossProbability = lossProbability; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
}

