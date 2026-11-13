package com.hospital.network.dto;

/**
 * Request DTO for Sliding Window protocol simulation.
 */
public class SlidingWindowRequest {
    private int totalFrames;
    private int windowSize;
    private int sequenceNumberBits;

    public SlidingWindowRequest() {}

    public SlidingWindowRequest(int totalFrames, int windowSize, int sequenceNumberBits) {
        this.totalFrames = totalFrames;
        this.windowSize = windowSize;
        this.sequenceNumberBits = sequenceNumberBits;
    }

    public int getTotalFrames() {
        return totalFrames;
    }

    public void setTotalFrames(int totalFrames) {
        this.totalFrames = totalFrames;
    }

    public int getWindowSize() {
        return windowSize;
    }

    public void setWindowSize(int windowSize) {
        this.windowSize = windowSize;
    }

    public int getSequenceNumberBits() {
        return sequenceNumberBits;
    }

    public void setSequenceNumberBits(int sequenceNumberBits) {
        this.sequenceNumberBits = sequenceNumberBits;
    }
}

