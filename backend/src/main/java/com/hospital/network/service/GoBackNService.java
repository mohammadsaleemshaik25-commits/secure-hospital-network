package com.hospital.network.service;

import com.hospital.network.dto.EventLogItem;
import com.hospital.network.dto.GoBackNRequest;
import com.hospital.network.dto.GoBackNResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Simulation of Go‑Back‑N ARQ protocol with optional frame loss.
 * Deterministic, synchronous simulation for educational purposes.
 */
@Service
public class GoBackNService {

    public GoBackNResponse simulate(GoBackNRequest req) {
        int totalFrames = req.getTotalFrames();
        int windowSize = req.getWindowSize();
        int bits = req.getSequenceNumberBits();
        int seqSpace = 1 << bits; // 2^bits
        List<Integer> lostIdx = req.getLostFrameIndexes();
        Set<Integer> lostSet = new HashSet<>(lostIdx != null ? lostIdx : List.of());
        Set<Integer> alreadyLost = new HashSet<>(); // track frames lost once

        // Validation
        if (totalFrames <= 0 || windowSize <= 0 || bits <= 0) {
            throw new IllegalArgumentException("Invalid configuration values");
        }
        if (windowSize > seqSpace) {
            throw new IllegalArgumentException("Window size cannot exceed sequence number space");
        }

        List<EventLogItem> log = new ArrayList<>();
        int base = 0;            // lowest unacknowledged frame index
        int next = 0;            // next frame index to send
        int totalTransmissions = 0;
        int totalRetransmissions = 0;

        while (base < totalFrames) {
            boolean lossOccurred = false;
            // Send frames within the current window
            while (next < totalFrames && next < base + windowSize) {
                int seq = next % seqSpace;
                log.add(new EventLogItem("SEND", next, seq, null,
                        "Sender transmits Frame " + next, false));
                totalTransmissions++;

                // Simulate loss on first transmission only
                if (lostSet.contains(next) && !alreadyLost.contains(next)) {
                    log.add(new EventLogItem("LOSS", next, seq, null,
                            "Frame " + next + " lost in channel", false));
                    alreadyLost.add(next);
                    lossOccurred = true;
                    // advance next so the lost frame is included in retransmit range
                    next++;
                    break; // exit sending loop to handle retransmission
                } else {
                    // Successful receive and immediate cumulative ACK
                    log.add(new EventLogItem("RECEIVE", next, seq, null,
                            "Receiver receives Frame " + next, false));
                    int ackNum = next + 1;
                    log.add(new EventLogItem("ACK", null, null, ackNum,
                            "Receiver sends ACK for Frame " + next, false));
                    base = ackNum; // slide window
                    next++;
                }
            }

            // If a loss occurred, retransmit all frames from base up to (next-1)
            if (lossOccurred) {
                for (int i = base; i < next; i++) {
                    int seq = i % seqSpace;
                    log.add(new EventLogItem("RETRANSMIT", i, seq, null,
                            "Retransmitting Frame " + i, true));
                    totalTransmissions++;
                    totalRetransmissions++;
                    // Assume retransmission succeeds
                    log.add(new EventLogItem("RECEIVE", i, seq, null,
                            "Receiver receives Frame " + i + " (retransmission)", false));
                    int ackNum = i + 1;
                    log.add(new EventLogItem("ACK", null, null, ackNum,
                            "Receiver sends ACK for Frame " + i + " (retransmission)", false));
                    base = ackNum; // slide window after each ACK
                }
                // Continue sending from the updated base
                next = base;
            }
        }

        int framesDelivered = totalFrames;
        int sequenceNumberSpace = seqSpace;
        return new GoBackNResponse(totalFrames, windowSize, bits, sequenceNumberSpace,
                log, totalTransmissions, totalRetransmissions, framesDelivered, true);
    }
}
