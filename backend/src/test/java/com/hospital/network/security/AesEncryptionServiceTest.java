package com.hospital.network.security;

import org.junit.jupiter.api.*;
import javax.crypto.AEADBadTagException;
import java.security.SecureRandom;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class AesEncryptionServiceTest {
    private static final String VALID_KEY_BASE64 = generateBase64Key(32);
    private AesEncryptionService service;

    @BeforeEach
    void setUp() throws Exception {
        setEnv("HOSPITAL_AES_KEY", VALID_KEY_BASE64);
        service = new AesEncryptionService();
    }

    @AfterEach
    void tearDown() throws Exception {
        setEnv("HOSPITAL_AES_KEY", null);
    }

    @Test
    void roundTripEncryptionDecryption() throws Exception {
        String plain = "Demo hospital message: Patient REF-1001";
        AesEncryptionService.EncryptionResult enc = service.encrypt(plain);
        assertNotNull(enc.getIv());
        assertNotNull(enc.getCiphertext());
        String dec = service.decrypt(enc.getIv(), enc.getCiphertext());
        assertEquals(plain, dec);
    }

    @Test
    void differentIvForRepeatedEncryption() {
        String plain = "same message";
        AesEncryptionService.EncryptionResult enc1 = service.encrypt(plain);
        AesEncryptionService.EncryptionResult enc2 = service.encrypt(plain);
        assertNotEquals(enc1.getIv(), enc2.getIv(), "IVs should differ for each encryption");
    }

    @Test
    void tamperedCiphertextRejected() {
        String plain = "message";
        AesEncryptionService.EncryptionResult enc = service.encrypt(plain);
        String badCipher = enc.getCiphertext() + "A"; // corrupt base64
        assertThrows(IllegalArgumentException.class, () -> service.decrypt(enc.getIv(), badCipher));
    }

    @Test
    void modifiedCiphertextThrowsAEADBadTagException() {
        AesEncryptionService.EncryptionResult enc = service.encrypt("Confidential patient diagnosis");
        byte[] cipherBytes = Base64.getDecoder().decode(enc.getCiphertext());
        cipherBytes[0] ^= 0x01; // flip 1 bit in ciphertext
        String modifiedCipher = Base64.getEncoder().encodeToString(cipherBytes);
        assertThrows(AEADBadTagException.class, () -> service.decrypt(enc.getIv(), modifiedCipher));
    }

    @Test
    void modifiedAuthTagThrowsAEADBadTagException() {
        AesEncryptionService.EncryptionResult enc = service.encrypt("Confidential patient diagnosis");
        byte[] cipherBytes = Base64.getDecoder().decode(enc.getCiphertext());
        cipherBytes[cipherBytes.length - 1] ^= 0x01; // flip 1 bit in authentication tag
        String modifiedCipher = Base64.getEncoder().encodeToString(cipherBytes);
        assertThrows(AEADBadTagException.class, () -> service.decrypt(enc.getIv(), modifiedCipher));
    }

    @Test
    void tamperedIvRejected() {
        AesEncryptionService.EncryptionResult enc = service.encrypt("msg");
        // flip first char (valid base64 char) – changes IV bits
        String badIv = "A" + enc.getIv().substring(1);
        assertThrows(AEADBadTagException.class, () -> service.decrypt(badIv, enc.getCiphertext()));
    }

    @Test
    void invalidIvLengthRejected() {
        AesEncryptionService.EncryptionResult enc = service.encrypt("msg");
        String shortIv = Base64.getEncoder().encodeToString(new byte[8]); // 8 bytes instead of 12
        assertThrows(IllegalArgumentException.class, () -> service.decrypt(shortIv, enc.getCiphertext()));
    }

    @Test
    void malformedCiphertextTooShortRejected() {
        AesEncryptionService.EncryptionResult enc = service.encrypt("msg");
        String shortCipher = Base64.getEncoder().encodeToString(new byte[10]); // less than 16-byte tag
        assertThrows(AEADBadTagException.class, () -> service.decrypt(enc.getIv(), shortCipher));
    }

    @Test
    void invalidBase64Rejected() {
        assertThrows(IllegalArgumentException.class, () -> service.decrypt("!!notbase64!!", "!!notbase64!!"));
    }

    @Test
    void invalidKeyLengthRejected() throws Exception {
        // key of 16 bytes (AES-128) – should cause service construction to fail on use
        setEnv("HOSPITAL_AES_KEY", generateBase64Key(16));
        AesEncryptionService badService = new AesEncryptionService();
        assertThrows(IllegalArgumentException.class, () -> badService.encrypt("test"));
    }

    @Test
    void missingKeyRejected() throws Exception {
        setEnv("HOSPITAL_AES_KEY", null);
        AesEncryptionService badService = new AesEncryptionService();
        assertThrows(IllegalArgumentException.class, () -> badService.encrypt("test"));
    }

    @Test
    void nullPlaintextRejected() {
        assertThrows(IllegalArgumentException.class, () -> service.encrypt(null));
    }

    @Test
    void nullIvOrCipherRejected() {
        assertThrows(IllegalArgumentException.class, () -> service.decrypt(null, "cipher"));
        assertThrows(IllegalArgumentException.class, () -> service.decrypt("iv", null));
    }

    // --- Helper methods ---------------------------------------------------
    private static String generateBase64Key(int length) {
        byte[] bytes = new byte[length];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private static void setEnv(String key, String value) {
        if (value == null) {
            System.clearProperty(key);
        } else {
            System.setProperty(key, value);
        }
    }
}
