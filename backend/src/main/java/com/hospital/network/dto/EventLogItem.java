package com.hospital.network.dto;

/**
 * Simple event log entry used by protocol simulations.
 */
public class EventLogItem {
    private String eventType; // e.g., "SEND", "RECEIVE", "ACK", "TIMEOUT", "RETRANSMIT"
    private Integer frameIndex; // zero‑based frame index, null for ACK events that are not tied to a specific frame
    private Integer sequenceNumber; // modulo value in the sequence space, null if not applicable
    private Integer ackNumber; // cumulative ACK number for ACK events, null otherwise
    private String description; // human readable description
    private boolean retransmission; // true if this event is a retransmission of a frame

    public EventLogItem() {}

    public EventLogItem(String eventType, Integer frameIndex, Integer sequenceNumber,
                        Integer ackNumber, String description, boolean retransmission) {
        this.eventType = eventType;
        this.frameIndex = frameIndex;
        this.sequenceNumber = sequenceNumber;
        this.ackNumber = ackNumber;
        this.description = description;
        this.retransmission = retransmission;
    }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Integer getFrameIndex() { return frameIndex; }
    public void setFrameIndex(Integer frameIndex) { this.frameIndex = frameIndex; }
    public Integer getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(Integer sequenceNumber) { this.sequenceNumber = sequenceNumber; }
    public Integer getAckNumber() { return ackNumber; }
    public void setAckNumber(Integer ackNumber) { this.ackNumber = ackNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isRetransmission() { return retransmission; }
    public void setRetransmission(boolean retransmission) { this.retransmission = retransmission; }
}

