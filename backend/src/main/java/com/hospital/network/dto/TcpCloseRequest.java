package com.hospital.network.dto;

public class TcpCloseRequest {
    private String connectionId;

    public TcpCloseRequest() {}

    public TcpCloseRequest(String connectionId) {
        this.connectionId = connectionId;
    }

    public String getConnectionId() { return connectionId; }
    public void setConnectionId(String connectionId) { this.connectionId = connectionId; }
}

