package com.hospital.network;

import com.hospital.network.dto.DecryptionRequest;
import com.hospital.network.dto.DecryptionResponse;
import com.hospital.network.dto.EncryptionRequest;
import com.hospital.network.dto.EncryptionResponse;
import com.hospital.network.dto.ErrorResponse;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DeploymentIntegrationTest {

    private static final String TEST_KEY_BASE64 = generateBase64Key(32);

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @BeforeAll
    static void initKey() {
        System.setProperty("sun.net.http.allowRestrictedHeaders", "true");
        System.setProperty("HOSPITAL_AES_KEY", TEST_KEY_BASE64);
    }

    @AfterAll
    static void cleanupKey() {
        System.clearProperty("sun.net.http.allowRestrictedHeaders");
        System.clearProperty("HOSPITAL_AES_KEY");
    }

    private String getBaseUrl() {
        return "http://localhost:" + port;
    }

    @Test
    void verifyHealthEndpoint() {
        ResponseEntity<Map> response = restTemplate.getForEntity(getBaseUrl() + "/api/health", Map.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("secure-hospital-network", response.getBody().get("service"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    void verifyAesEncryptionAndDecryptionOverHttp() {
        String originalMessage = "Clinical note: Patient admitted to Cardiology Ward Bed 02";

        // 1. Encrypt
        EncryptionRequest encReq = new EncryptionRequest(originalMessage);
        ResponseEntity<EncryptionResponse> encRes = restTemplate.postForEntity(
                getBaseUrl() + "/api/encryption/encrypt", encReq, EncryptionResponse.class);

        assertEquals(HttpStatus.OK, encRes.getStatusCode());
        assertNotNull(encRes.getBody());
        String iv = encRes.getBody().getIv();
        String ciphertext = encRes.getBody().getCiphertext();
        assertNotNull(iv);
        assertNotNull(ciphertext);

        // 2. Decrypt
        DecryptionRequest decReq = new DecryptionRequest(iv, ciphertext);
        ResponseEntity<DecryptionResponse> decRes = restTemplate.postForEntity(
                getBaseUrl() + "/api/encryption/decrypt", decReq, DecryptionResponse.class);

        assertEquals(HttpStatus.OK, decRes.getStatusCode());
        assertNotNull(decRes.getBody());
        assertEquals(originalMessage, decRes.getBody().getPlaintext());
    }

    @Test
    void verifyTamperedCiphertextReturnsHttp400OverHttp() {
        String originalMessage = "Emergency order: Administer Epinephrine 1mg";

        // Encrypt valid message
        EncryptionRequest encReq = new EncryptionRequest(originalMessage);
        ResponseEntity<EncryptionResponse> encRes = restTemplate.postForEntity(
                getBaseUrl() + "/api/encryption/encrypt", encReq, EncryptionResponse.class);
        assertEquals(HttpStatus.OK, encRes.getStatusCode());

        String iv = encRes.getBody().getIv();
        byte[] cipherBytes = Base64.getDecoder().decode(encRes.getBody().getCiphertext());
        cipherBytes[0] ^= 0x55; // tamper bits
        String tamperedCiphertext = Base64.getEncoder().encodeToString(cipherBytes);

        // Send tampered ciphertext
        DecryptionRequest decReq = new DecryptionRequest(iv, tamperedCiphertext);
        ResponseEntity<ErrorResponse> errorRes = restTemplate.postForEntity(
                getBaseUrl() + "/api/encryption/decrypt", decReq, ErrorResponse.class);

        assertEquals(HttpStatus.BAD_REQUEST, errorRes.getStatusCode());
        assertNotNull(errorRes.getBody());
        assertEquals("Authentication failed: Ciphertext has been modified or is invalid.", errorRes.getBody().getMessage());
        assertTrue(errorRes.getBody().getTimestamp() > 0);
    }

    @Test
    void verifyCorsHeadersOnGetRequest() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Origin", "http://localhost:5173");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                getBaseUrl() + "/api/health", HttpMethod.GET, entity, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("http://localhost:5173", response.getHeaders().getAccessControlAllowOrigin());
        assertTrue(response.getHeaders().getAccessControlAllowCredentials());
    }

    private static String generateBase64Key(int length) {
        byte[] bytes = new byte[length];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
}
