package com.hospital.network.dto;

public class TcpDataRequest {
    private String connectionId;
    private String payload;
    private Double lossProbability; // optional 0..1
    private Integer maxRetries; // optional, default 3

    public TcpDataRequest() {}

    public TcpDataRequest(String connectionId, String payload, Double lossProbability, Integer maxRetries) {
        this.connectionId = connectionId;
        this.payload = payload;
        this.lossProbability = lossProbability;
        this.maxRetries = maxRetries;
    }

    public String getConnectionId() { return connectionId; }
    public void setConnectionId(String connectionId) { this.connectionId = connectionId; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public Double getLossProbability() { return lossProbability; }
    public void setLossProbability(Double lossProbability) { this.lossProbability = lossProbability; }
    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }
}

