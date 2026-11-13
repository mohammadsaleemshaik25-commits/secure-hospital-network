package com.hospital.network.service;

import com.hospital.network.dto.EventLogItem;
import com.hospital.network.dto.SlidingWindowRequest;
import com.hospital.network.dto.SlidingWindowResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Simulation of a generic Sliding Window protocol (no loss, immediate ACKs).
 * This is a deterministic, synchronous simulation used for educational purposes.
 */
@Service
public class SlidingWindowService {

    public SlidingWindowResponse simulate(SlidingWindowRequest req) {
        int totalFrames = req.getTotalFrames();
        int windowSize = req.getWindowSize();
        int bits = req.getSequenceNumberBits();
        int seqSpace = 1 << bits; // 2^bits

        // Basic validation
        if (totalFrames <= 0 || windowSize <= 0 || bits <= 0) {
            throw new IllegalArgumentException("Invalid configuration values");
        }
        if (windowSize > seqSpace) {
            throw new IllegalArgumentException("Window size cannot exceed sequence number space");
        }

        List<EventLogItem> log = new ArrayList<>();
        int base = 0;               // lowest unacknowledged frame index
        int nextToSend = 0;          // next frame index to transmit
        int totalTransmissions = 0;
        int totalRetransmissions = 0; // always zero for this simple simulation

        while (base < totalFrames) {
            // Send frames within window
            while (nextToSend < base + windowSize && nextToSend < totalFrames) {
                int seq = nextToSend % seqSpace;
                log.add(new EventLogItem("SEND", nextToSend, seq, null,
                        "Sender transmits Frame " + nextToSend, false));
                totalTransmissions++;

                // Immediate receive
                log.add(new EventLogItem("RECEIVE", nextToSend, seq, null,
                        "Receiver receives Frame " + nextToSend, false));

                // Immediate ACK
                int ackNum = nextToSend + 1; // cumulative ACK for next expected frame
                log.add(new EventLogItem("ACK", null, null, ackNum,
                        "Receiver sends ACK for Frame " + nextToSend, false));

                // Advance sender window
                base = ackNum;
                nextToSend++;
            }
        }

        int framesDelivered = totalFrames;
        return new SlidingWindowResponse(totalFrames, windowSize, bits, seqSpace,
                log, totalTransmissions, totalRetransmissions, framesDelivered, true);
    }
}

