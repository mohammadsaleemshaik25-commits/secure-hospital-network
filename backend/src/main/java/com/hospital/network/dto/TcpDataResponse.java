package com.hospital.network.dto;

public class TcpDataResponse {
    private long ackNumber;
    private boolean retransmissionRequired;
    private long totalBytesSent;

    public TcpDataResponse() {}

    public TcpDataResponse(long ackNumber, boolean retransmissionRequired, long totalBytesSent) {
        this.ackNumber = ackNumber;
        this.retransmissionRequired = retransmissionRequired;
        this.totalBytesSent = totalBytesSent;
    }

    public long getAckNumber() { return ackNumber; }
    public void setAckNumber(long ackNumber) { this.ackNumber = ackNumber; }
    public boolean isRetransmissionRequired() { return retransmissionRequired; }
    public void setRetransmissionRequired(boolean retransmissionRequired) { this.retransmissionRequired = retransmissionRequired; }
    public long getTotalBytesSent() { return totalBytesSent; }
    public void setTotalBytesSent(long totalBytesSent) { this.totalBytesSent = totalBytesSent; }
}

