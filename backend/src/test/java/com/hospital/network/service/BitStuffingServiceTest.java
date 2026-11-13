package com.hospital.network.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
class BitStuffingServiceTest {

    private final BitStuffingService service = new BitStuffingService();

    @Test
    void encodeInsertsZeroAfterFiveOnes() {
        String raw = "1111111111"; // ten consecutive 1s
        String encoded = service.encode(raw);
        // Expect a 0 inserted after each group of five 1s
        assertThat(encoded).isEqualTo("111110111110");
    }

    @Test
    void decodeRestoresOriginalSequence() {
        String encoded = "111110111110"; // result of encoding ten 1s
        String decoded = service.decode(encoded);
        assertThat(decoded).isEqualTo("1111111111");
    }

    @Test
    void decodeMalformedThrows() {
        // After five 1s the next bit is 1 (should be 0)
        String malformed = "111111"; // five 1s followed by another 1 without stuffing
        assertThatThrownBy(() -> service.decode(malformed))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Malformed stuffed data");
    }
}

