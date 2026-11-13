package com.hospital.network.dto;

public class TcpConnectResponse {
    private String connectionId;
    private String state;
    private long clientSeq;
    private long serverSeq;
    private java.util.List<String> eventLog;

    public TcpConnectResponse() {}

    public TcpConnectResponse(String connectionId, String state, long clientSeq, long serverSeq, java.util.List<String> eventLog) {
        this.connectionId = connectionId;
        this.state = state;
        this.clientSeq = clientSeq;
        this.serverSeq = serverSeq;
        this.eventLog = eventLog;
    }

    public String getConnectionId() { return connectionId; }
    public void setConnectionId(String connectionId) { this.connectionId = connectionId; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public long getClientSeq() { return clientSeq; }
    public void setClientSeq(long clientSeq) { this.clientSeq = clientSeq; }
    public long getServerSeq() { return serverSeq; }
    public void setServerSeq(long serverSeq) { this.serverSeq = serverSeq; }
    public java.util.List<String> getEventLog() { return eventLog; }
    public void setEventLog(java.util.List<String> eventLog) { this.eventLog = eventLog; }
}

