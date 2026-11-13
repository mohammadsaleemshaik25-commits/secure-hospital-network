package com.hospital.network.service;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link CrcService} covering CRC‑16‑CCITT‑FALSE and CRC‑32.
 */
class CrcServiceTest {
    private CrcService service;

    @BeforeEach
    void setUp() {
        service = new CrcService();
    }

    // ---------- CRC‑16 ----------
    @Test
    void crc16_knownVector() {
        assertEquals("29B1", service.calculateCrc16("123456789"));
    }

    @Test
    void crc16_emptyInput() {
        assertEquals("FFFF", service.calculateCrc16("")); // CRC‑16 of empty string with init 0xFFFF
    }

    @Test
    void crc16_normalText() {
        String text = "Hello CRC";
        String crc = service.calculateCrc16(text);
        assertNotNull(crc);
        assertTrue(crc.matches("[0-9A-F]{4}"));
        assertTrue(service.verifyCrc16(text, crc));
    }

    @Test
    void crc16_utf8Text() {
        String text = "こんにちは"; // Japanese "Hello"
        String crc = service.calculateCrc16(text);
        assertTrue(service.verifyCrc16(text, crc));
    }

    @Test
    void crc16_verifyValid() {
        String data = "TestMessage";
        String crc = service.calculateCrc16(data);
        assertTrue(service.verifyCrc16(data, crc));
    }

    @Test
    void crc16_verifyInvalid() {
        assertFalse(service.verifyCrc16("ABC", "0000"));
    }

    @Test
    void crc16_caseInsensitiveVerification() {
        String data = "CaseTest";
        String crc = service.calculateCrc16(data).toLowerCase();
        assertTrue(service.verifyCrc16(data, crc));
    }

    // ---------- CRC‑32 ----------
    @Test
    void crc32_knownVector() {
        assertEquals("CBF43926", service.calculateCrc32("123456789"));
    }

    @Test
    void crc32_emptyInput() {
        assertEquals("00000000", service.calculateCrc32(""));
    }

    @Test
    void crc32_normalText() {
        String text = "Hello CRC32";
        String crc = service.calculateCrc32(text);
        assertNotNull(crc);
        assertTrue(crc.matches("[0-9A-F]{8}"));
        assertTrue(service.verifyCrc32(text, crc));
    }

    @Test
    void crc32_utf8Text() {
        String text = "Привет"; // Russian "Hi"
        String crc = service.calculateCrc32(text);
        assertTrue(service.verifyCrc32(text, crc));
    }

    @Test
    void crc32_verifyValid() {
        String data = "AnotherMessage";
        String crc = service.calculateCrc32(data);
        assertTrue(service.verifyCrc32(data, crc));
    }

    @Test
    void crc32_verifyInvalid() {
        assertFalse(service.verifyCrc32("XYZ", "FFFFFFFF"));
    }

    @Test
    void crc32_caseInsensitiveVerification() {
        String data = "CaseCRC32";
        String crc = service.calculateCrc32(data).toLowerCase();
        assertTrue(service.verifyCrc32(data, crc));
    }
}

