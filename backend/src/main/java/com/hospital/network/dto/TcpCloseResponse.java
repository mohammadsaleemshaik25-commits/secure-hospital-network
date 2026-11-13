package com.hospital.network.dto;

public class TcpCloseResponse {
    private String connectionId;
    private String finalState;

    public TcpCloseResponse() {}

    public TcpCloseResponse(String connectionId, String finalState) {
        this.connectionId = connectionId;
        this.finalState = finalState;
    }

    public String getConnectionId() { return connectionId; }
    public void setConnectionId(String connectionId) { this.connectionId = connectionId; }
    public String getFinalState() { return finalState; }
    public void setFinalState(String finalState) { this.finalState = finalState; }
}

