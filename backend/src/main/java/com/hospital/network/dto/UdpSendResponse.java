package com.hospital.network.dto;

public class UdpSendResponse {
    private String packetId;
    private boolean delivered;

    public UdpSendResponse() {}

    public UdpSendResponse(String packetId, boolean delivered) {
        this.packetId = packetId;
        this.delivered = delivered;
    }

    public String getPacketId() { return packetId; }
    public void setPacketId(String packetId) { this.packetId = packetId; }
    public boolean isDelivered() { return delivered; }
    public void setDelivered(boolean delivered) { this.delivered = delivered; }
}

