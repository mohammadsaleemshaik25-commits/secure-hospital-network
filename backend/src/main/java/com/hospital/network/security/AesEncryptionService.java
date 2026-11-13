package com.hospital.network.security;

import org.springframework.stereotype.Service;

import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service providing AES‑256‑GCM encryption and decryption.
 * <p>
 * The secret key is retrieved from the environment variable {@code HOSPITAL_AES_KEY}.
 * The key must be a Base64‑encoded 32‑byte (256‑bit) value. If the variable is missing
 * or the decoded length is not 32 bytes, an {@link IllegalArgumentException} is thrown.
 * </p>
 */
@Service
public class AesEncryptionService {
    private static final String AES_ALGORITHM = "AES";
    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; // bits
    private static final int IV_LENGTH = 12; // bytes (96‑bit nonce recommended for GCM)
    private static final int MIN_CIPHERTEXT_LENGTH = 16; // bytes (128-bit authentication tag)
    private static final SecureRandom RANDOM = new SecureRandom();

    private SecretKey getSecretKey() {
        String keyB64 = System.getenv("HOSPITAL_AES_KEY");
        if (keyB64 == null || keyB64.isBlank()) {
            keyB64 = System.getProperty("HOSPITAL_AES_KEY");
        }
        if (keyB64 == null || keyB64.isBlank()) {
            throw new IllegalArgumentException("Encryption key not configured in HOSPITAL_AES_KEY");
        }
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(keyB64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Encryption key is not valid Base64", e);
        }
        if (decoded.length != 32) {
            throw new IllegalArgumentException("Encryption key must be 256 bits (32 bytes) after Base64 decoding");
        }
        return new SecretKeySpec(decoded, AES_ALGORITHM);
    }

    /**
     * Encrypts the given plaintext using a fresh random IV.
     *
     * @param plaintext UTF‑8 string to encrypt (must not be null)
     * @return {@code EncryptionResult} containing Base64‑encoded IV and ciphertext
     */
    public EncryptionResult encrypt(String plaintext) {
        if (plaintext == null) {
            throw new IllegalArgumentException("Plaintext must not be null");
        }
        try {
            byte[] iv = new byte[IV_LENGTH];
            RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), spec);
            byte[] cipherBytes = cipher.doFinal(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return new EncryptionResult(Base64.getEncoder().encodeToString(iv),
                                        Base64.getEncoder().encodeToString(cipherBytes));
        } catch (IllegalArgumentException e) {
            // Propagate configuration errors (missing or invalid key)
            throw e;
        } catch (Exception e) {
            // Wrap any crypto exception as a runtime to be handled by controller advice
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypts the supplied Base64‑encoded IV and ciphertext.
     *
     * @param ivB64        Base64 IV (nonce)
     * @param cipherB64    Base64 ciphertext (includes GCM authentication tag)
     * @return the original plaintext string
     * @throws AEADBadTagException if ciphertext or tag or IV is modified or invalid
     */
    public String decrypt(String ivB64, String cipherB64) throws AEADBadTagException {
        if (ivB64 == null || cipherB64 == null) {
            throw new IllegalArgumentException("IV and ciphertext must be provided");
        }
        if (ivB64.isBlank() || cipherB64.isBlank()) {
            throw new IllegalArgumentException("IV and ciphertext must not be empty");
        }
        byte[] iv;
        byte[] cipherBytes;
        try {
            iv = Base64.getDecoder().decode(ivB64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Base64 encoding for IV", e);
        }
        try {
            cipherBytes = Base64.getDecoder().decode(cipherB64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Base64 encoding for ciphertext", e);
        }
        if (iv.length != IV_LENGTH) {
            throw new IllegalArgumentException("Invalid IV length: expected " + IV_LENGTH + " bytes, got " + iv.length);
        }
        if (cipherBytes.length < MIN_CIPHERTEXT_LENGTH) {
            throw new AEADBadTagException("Authentication failed: Ciphertext has been modified or is invalid.");
        }
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), spec);
            byte[] plainBytes = cipher.doFinal(cipherBytes);
            return new String(plainBytes, java.nio.charset.StandardCharsets.UTF_8);
        } catch (AEADBadTagException e) {
            throw e;
        } catch (GeneralSecurityException e) {
            throw new AEADBadTagException("Authentication failed: Ciphertext has been modified or is invalid.");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /** Simple DTO to carry encryption output */
    public static class EncryptionResult {
        private final String iv;
        private final String ciphertext;
        public EncryptionResult(String iv, String ciphertext) {
            this.iv = iv;
            this.ciphertext = ciphertext;
        }
        public String getIv() { return iv; }
        public String getCiphertext() { return ciphertext; }
    }
}

