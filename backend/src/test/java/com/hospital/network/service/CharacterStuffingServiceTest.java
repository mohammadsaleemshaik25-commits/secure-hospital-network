package com.hospital.network.service;

import com.hospital.network.dto.CharacterStuffingRequest;
import com.hospital.network.dto.CharacterStuffingResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
class CharacterStuffingServiceTest {

    private final CharacterStuffingService service = new CharacterStuffingService();

    @Test
    void encodeDecodeNormalPayload() {
        String payload = "HelloWorld";
        String encoded = service.encode(payload);
        // Should start and end with FLAG and contain no ESC since none needed
        assertThat(encoded).startsWith(CharacterStuffingService.FLAG);
        assertThat(encoded).endsWith(CharacterStuffingService.FLAG);
        String decoded = service.decode(encoded);
        assertThat(decoded).isEqualTo(payload);
    }

    @Test
    void encodeDecodeWithSpecialCharacters() {
        // payload contains FLAG and ESC that must be escaped
        String payload = "Start" + CharacterStuffingService.FLAG + "Mid" + CharacterStuffingService.ESC + "End";
        String encoded = service.encode(payload);
        // Verify that ESC sequences appear in the encoded frame
        assertThat(encoded).contains(CharacterStuffingService.ESC + CharacterStuffingService.FLAG);
        assertThat(encoded).contains(CharacterStuffingService.ESC + CharacterStuffingService.ESC);
        // Decode should return original payload unchanged
        String decoded = service.decode(encoded);
        assertThat(decoded).isEqualTo(payload);
    }
}

