package com.hospital.network.dto;

public class TcpConnectRequest {
    private Integer srcPort;
    private Integer dstPort;
    private Double lossProbability; // optional, 0..1

    public TcpConnectRequest() {}

    public TcpConnectRequest(Integer srcPort, Integer dstPort, Double lossProbability) {
        this.srcPort = srcPort;
        this.dstPort = dstPort;
        this.lossProbability = lossProbability;
    }

    public Integer getSrcPort() { return srcPort; }
    public void setSrcPort(Integer srcPort) { this.srcPort = srcPort; }
    public Integer getDstPort() { return dstPort; }
    public void setDstPort(Integer dstPort) { this.dstPort = dstPort; }
    public Double getLossProbability() { return lossProbability; }
    public void setLossProbability(Double lossProbability) { this.lossProbability = lossProbability; }
}

