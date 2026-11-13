package com.hospital.network.dto;

import java.util.List;

/**
 * Response DTO for Sliding Window simulation.
 */
public class SlidingWindowResponse {
    private String protocol = "Sliding Window";
    private int totalFrames;
    private int windowSize;
    private int sequenceNumberBits;
    private int sequenceNumberSpace;
    private List<EventLogItem> eventLog;
    private int totalTransmissions;
    private int totalRetransmissions;
    private int framesDelivered;
    private boolean completed;

    public SlidingWindowResponse() {}

    public SlidingWindowResponse(int totalFrames, int windowSize, int sequenceNumberBits,
                                 int sequenceNumberSpace, List<EventLogItem> eventLog,
                                 int totalTransmissions, int totalRetransmissions,
                                 int framesDelivered, boolean completed) {
        this.totalFrames = totalFrames;
        this.windowSize = windowSize;
        this.sequenceNumberBits = sequenceNumberBits;
        this.sequenceNumberSpace = sequenceNumberSpace;
        this.eventLog = eventLog;
        this.totalTransmissions = totalTransmissions;
        this.totalRetransmissions = totalRetransmissions;
        this.framesDelivered = framesDelivered;
        this.completed = completed;
    }

    public String getProtocol() { return protocol; }
    public int getTotalFrames() { return totalFrames; }
    public int getWindowSize() { return windowSize; }
    public int getSequenceNumberBits() { return sequenceNumberBits; }
    public int getSequenceNumberSpace() { return sequenceNumberSpace; }
    public List<EventLogItem> getEventLog() { return eventLog; }
    public int getTotalTransmissions() { return totalTransmissions; }
    public int getTotalRetransmissions() { return totalRetransmissions; }
    public int getFramesDelivered() { return framesDelivered; }
    public boolean isCompleted() { return completed; }

    public void setProtocol(String protocol) { this.protocol = protocol; }
    public void setTotalFrames(int totalFrames) { this.totalFrames = totalFrames; }
    public void setWindowSize(int windowSize) { this.windowSize = windowSize; }
    public void setSequenceNumberBits(int sequenceNumberBits) { this.sequenceNumberBits = sequenceNumberBits; }
    public void setSequenceNumberSpace(int sequenceNumberSpace) { this.sequenceNumberSpace = sequenceNumberSpace; }
    public void setEventLog(List<EventLogItem> eventLog) { this.eventLog = eventLog; }
    public void setTotalTransmissions(int totalTransmissions) { this.totalTransmissions = totalTransmissions; }
    public void setTotalRetransmissions(int totalRetransmissions) { this.totalRetransmissions = totalRetransmissions; }
    public void setFramesDelivered(int framesDelivered) { this.framesDelivered = framesDelivered; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}

