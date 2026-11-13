package com.hospital.network.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.network.dto.DecryptionRequest;
import com.hospital.network.dto.ErrorResponse;
import com.hospital.network.security.AesEncryptionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.SecureRandom;
import java.util.Base64;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EncryptionControllerTest {

    private static final String AUTH_FAILED_MSG = "Authentication failed: Ciphertext has been modified or is invalid.";
    private static final String VALID_KEY_BASE64 = generateBase64Key(32);

    private AesEncryptionService service;
    private EncryptionController controller;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        System.setProperty("HOSPITAL_AES_KEY", VALID_KEY_BASE64);
        service = new AesEncryptionService();
        controller = new EncryptionController(service);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @AfterEach
    void tearDown() {
        System.clearProperty("HOSPITAL_AES_KEY");
    }

    @Test
    void correctCiphertextDecryptsSuccessfully() throws Exception {
        String originalPlaintext = "Patient ID: 48921 - Diagnosis: Cardiac Monitoring Normal";
        AesEncryptionService.EncryptionResult enc = service.encrypt(originalPlaintext);

        DecryptionRequest request = new DecryptionRequest(enc.getIv(), enc.getCiphertext());

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plaintext", is(originalPlaintext)));
    }

    @Test
    void modifiedCiphertextReturnsControlled400Response() throws Exception {
        String originalPlaintext = "Medication Order: Heparin 5000 units IV";
        AesEncryptionService.EncryptionResult enc = service.encrypt(originalPlaintext);

        // Tamper with the ciphertext by flipping a bit in the ciphertext bytes
        byte[] cipherBytes = Base64.getDecoder().decode(enc.getCiphertext());
        cipherBytes[0] ^= 0x01;
        String modifiedCiphertext = Base64.getEncoder().encodeToString(cipherBytes);

        DecryptionRequest request = new DecryptionRequest(enc.getIv(), modifiedCiphertext);

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is(AUTH_FAILED_MSG)))
                .andExpect(jsonPath("$.timestamp").isNumber());
    }

    @Test
    void modifiedIvReturnsControlled400Response() throws Exception {
        String originalPlaintext = "ICU Bed 12: Pulse 78, BP 120/80";
        AesEncryptionService.EncryptionResult enc = service.encrypt(originalPlaintext);

        // Tamper with the IV by flipping a bit in the valid 12-byte IV
        byte[] ivBytes = Base64.getDecoder().decode(enc.getIv());
        ivBytes[0] ^= 0x01;
        String modifiedIv = Base64.getEncoder().encodeToString(ivBytes);

        DecryptionRequest request = new DecryptionRequest(modifiedIv, enc.getCiphertext());

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is(AUTH_FAILED_MSG)))
                .andExpect(jsonPath("$.timestamp").isNumber());
    }

    @Test
    void invalidBase64ReturnsControlled400Response() throws Exception {
        String originalPlaintext = "Surgical Theater 3 - Ready";
        AesEncryptionService.EncryptionResult enc = service.encrypt(originalPlaintext);

        // Invalid Base64 in ciphertext
        DecryptionRequest requestBadCipher = new DecryptionRequest(enc.getIv(), "!!not-valid-base64!!");

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBadCipher)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid Base64 encoding")))
                .andExpect(jsonPath("$.timestamp").isNumber());

        // Invalid Base64 in IV
        DecryptionRequest requestBadIv = new DecryptionRequest("??invalid-iv-base64??", enc.getCiphertext());

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBadIv)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid Base64 encoding")))
                .andExpect(jsonPath("$.timestamp").isNumber());
    }

    @Test
    void invalidIvLengthReturnsControlled400Response() throws Exception {
        String originalPlaintext = "Emergency department alert";
        AesEncryptionService.EncryptionResult enc = service.encrypt(originalPlaintext);

        // Provide an 8-byte IV instead of 12 bytes
        String shortIv = Base64.getEncoder().encodeToString(new byte[8]);
        DecryptionRequest request = new DecryptionRequest(shortIv, enc.getCiphertext());

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid IV length")))
                .andExpect(jsonPath("$.timestamp").isNumber());
    }

    @Test
    void missingIvOrCiphertextReturnsControlled400Response() throws Exception {
        // Missing IV
        DecryptionRequest noIv = new DecryptionRequest(null, "some-ciphertext");
        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noIv)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("IV and ciphertext must be provided")));

        // Missing Ciphertext
        DecryptionRequest noCipher = new DecryptionRequest("some-iv", null);
        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noCipher)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("IV and ciphertext must be provided")));

        // Empty string IV
        DecryptionRequest emptyIv = new DecryptionRequest("   ", "some-ciphertext");
        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyIv)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("IV and ciphertext must be provided")));
    }

    @Test
    void modifiedAuthTagReturnsControlled400Response() throws Exception {
        String originalPlaintext = "Secure telemetry frame";
        AesEncryptionService.EncryptionResult enc = service.encrypt(originalPlaintext);

        // Modify authentication tag (last byte of ciphertext)
        byte[] cipherBytes = Base64.getDecoder().decode(enc.getCiphertext());
        cipherBytes[cipherBytes.length - 1] ^= 0x01;
        String modifiedTagCiphertext = Base64.getEncoder().encodeToString(cipherBytes);

        DecryptionRequest request = new DecryptionRequest(enc.getIv(), modifiedTagCiphertext);

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is(AUTH_FAILED_MSG)))
                .andExpect(jsonPath("$.timestamp").isNumber());
    }

    @Test
    void malformedCiphertextTooShortReturnsControlled400Response() throws Exception {
        AesEncryptionService.EncryptionResult enc = service.encrypt("test");

        // Ciphertext with fewer than 16 bytes (less than tag length)
        String shortCipher = Base64.getEncoder().encodeToString(new byte[10]);
        DecryptionRequest request = new DecryptionRequest(enc.getIv(), shortCipher);

        mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is(AUTH_FAILED_MSG)));
    }

    @Test
    void securityCheck_errorResponsesDoNotExposeInternalDetails() throws Exception {
        DecryptionRequest request = new DecryptionRequest("bad-iv-base64!!!", "bad-cipher-base64!!!");

        String responseContent = mockMvc.perform(post("/api/encryption/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Verify JSON matches ErrorResponse and does not contain stack trace, secret key, or class names
        ErrorResponse errorResponse = objectMapper.readValue(responseContent, ErrorResponse.class);
        assertNotNull(errorResponse.getMessage());
        assertTrue(errorResponse.getTimestamp() > 0);

        assertFalse(responseContent.contains("Exception"));
        assertFalse(responseContent.contains("stackTrace"));
        assertFalse(responseContent.contains("HOSPITAL_AES_KEY"));
        assertFalse(responseContent.contains(VALID_KEY_BASE64));
    }

    private static String generateBase64Key(int length) {
        byte[] bytes = new byte[length];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
}

