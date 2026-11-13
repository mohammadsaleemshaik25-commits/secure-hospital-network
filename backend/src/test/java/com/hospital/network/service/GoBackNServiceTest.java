package com.hospital.network.service;

import com.hospital.network.dto.GoBackNRequest;
import com.hospital.network.dto.GoBackNResponse;
import com.hospital.network.dto.EventLogItem;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class GoBackNServiceTest {

    private final GoBackNService service = new GoBackNService();

    @Test
    void testNormalTransmissionNoLoss() {
        GoBackNRequest req = new GoBackNRequest(5, 3, 3, List.of());
        GoBackNResponse resp = service.simulate(req);
        assertTrue(resp.isCompleted());
        assertEquals(5, resp.getTotalFrames());
        // Expect SEND, RECEIVE, ACK for each frame = 5 * 3 events
        assertEquals(5 * 3, resp.getEventLog().size());
        // No LOSS or RETRANSMIT events
        long lossCount = resp.getEventLog().stream().filter(e -> "LOSS".equals(e.getEventType())).count();
        long retransCount = resp.getEventLog().stream().filter(e -> "RETRANSMIT".equals(e.getEventType())).count();
        assertEquals(0, lossCount);
        assertEquals(0, retransCount);
    }

    @Test
    void testTransmissionWithLoss() {
        // Lose frame index 2 (third frame)
        GoBackNRequest req = new GoBackNRequest(4, 2, 2, List.of(2));
        GoBackNResponse resp = service.simulate(req);
        assertTrue(resp.isCompleted());
        // Should contain a LOSS event for frame 2
        boolean lossFound = resp.getEventLog().stream()
                .anyMatch(e -> "LOSS".equals(e.getEventType()) && e.getFrameIndex() != null && e.getFrameIndex() == 2);
        assertTrue(lossFound, "LOSS event for frame 2 expected");
        // Should contain RETRANSMIT events (at least for the lost frame)
        long retransCount = resp.getEventLog().stream().filter(e -> "RETRANSMIT".equals(e.getEventType())).count();
        assertTrue(retransCount >= 1, "At least one retransmission expected");
    }

    @Test
    void testInvalidConfigurationWindowTooLarge() {
        // sequence space = 2^2 = 4, window size 5 is invalid
        GoBackNRequest req = new GoBackNRequest(3, 5, 2, List.of());
        assertThrows(IllegalArgumentException.class, () -> service.simulate(req));
    }

    @Test
    void testInvalidConfigurationNegativeValues() {
        GoBackNRequest req = new GoBackNRequest(0, 0, 0, List.of());
        assertThrows(IllegalArgumentException.class, () -> service.simulate(req));
    }
}

