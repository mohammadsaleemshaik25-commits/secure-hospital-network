package com.hospital.network.dto;

import java.util.List;

/**
 * Request DTO for Go-Back-N ARQ simulation.
 */
public class GoBackNRequest {
    private int totalFrames;
    private int windowSize;
    private int sequenceNumberBits;
    private List<Integer> lostFrameIndexes;

    public GoBackNRequest() {}

    public GoBackNRequest(int totalFrames, int windowSize, int sequenceNumberBits, List<Integer> lostFrameIndexes) {
        this.totalFrames = totalFrames;
        this.windowSize = windowSize;
        this.sequenceNumberBits = sequenceNumberBits;
        this.lostFrameIndexes = lostFrameIndexes;
    }

    public int getTotalFrames() { return totalFrames; }
    public void setTotalFrames(int totalFrames) { this.totalFrames = totalFrames; }
    public int getWindowSize() { return windowSize; }
    public void setWindowSize(int windowSize) { this.windowSize = windowSize; }
    public int getSequenceNumberBits() { return sequenceNumberBits; }
    public void setSequenceNumberBits(int sequenceNumberBits) { this.sequenceNumberBits = sequenceNumberBits; }
    public List<Integer> getLostFrameIndexes() { return lostFrameIndexes; }
    public void setLostFrameIndexes(List<Integer> lostFrameIndexes) { this.lostFrameIndexes = lostFrameIndexes; }
}

