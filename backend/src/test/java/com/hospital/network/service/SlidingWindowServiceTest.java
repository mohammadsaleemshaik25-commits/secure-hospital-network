package com.hospital.network.service;

import com.hospital.network.dto.SlidingWindowRequest;
import com.hospital.network.dto.SlidingWindowResponse;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SlidingWindowServiceTest {

    private final SlidingWindowService service = new SlidingWindowService();

    @Test
    void testNormalTransmission() {
        SlidingWindowRequest req = new SlidingWindowRequest(8, 4, 3);
        SlidingWindowResponse resp = service.simulate(req);
        assertTrue(resp.isCompleted());
        assertEquals(8, resp.getTotalFrames());
        assertEquals(8, resp.getTotalTransmissions());
        assertEquals(0, resp.getTotalRetransmissions());
        assertEquals(8, resp.getFramesDelivered());
        // each frame generates three events: SEND, RECEIVE, ACK
        assertEquals(8 * 3, resp.getEventLog().size());
        // Verify first and last events
        assertEquals("SEND", resp.getEventLog().get(0).getEventType());
        assertEquals("ACK", resp.getEventLog().get(resp.getEventLog().size() - 1).getEventType());
    }

    @Test
    void testWindowSizeEqualsSequenceSpace() {
        SlidingWindowRequest req = new SlidingWindowRequest(5, 4, 2); // seqSpace = 4
        SlidingWindowResponse resp = service.simulate(req);
        assertTrue(resp.isCompleted());
        assertEquals(5, resp.getTotalFrames());
    }

    @Test
    void testInvalidConfiguration() {
        SlidingWindowRequest req = new SlidingWindowRequest(0, 0, 0);
        assertThrows(IllegalArgumentException.class, () -> service.simulate(req));
    }
}

