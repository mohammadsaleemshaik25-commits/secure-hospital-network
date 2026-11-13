package com.hospital.network.controller;

import com.hospital.network.dto.*;
import com.hospital.network.security.AesEncryptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.AEADBadTagException;

@RestController
@RequestMapping("/api/encryption")
public class EncryptionController {
    private static final String AUTH_FAILED_MSG = "Authentication failed: Ciphertext has been modified or is invalid.";
    private final AesEncryptionService service;

    public EncryptionController(AesEncryptionService service) {
        this.service = service;
    }

    @PostMapping("/encrypt")
    public ResponseEntity<?> encrypt(@RequestBody EncryptionRequest request) {
        if (request == null || request.getPlaintext() == null || request.getPlaintext().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Plaintext must be provided"));
        }
        try {
            AesEncryptionService.EncryptionResult result = service.encrypt(request.getPlaintext());
            return ResponseEntity.ok(new EncryptionResponse(result.getIv(), result.getCiphertext()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Encryption failed"));
        }
    }

    @PostMapping("/decrypt")
    public ResponseEntity<?> decrypt(@RequestBody DecryptionRequest request) {
        if (request == null || request.getIv() == null || request.getIv().isBlank()
                || request.getCiphertext() == null || request.getCiphertext().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("IV and ciphertext must be provided"));
        }
        try {
            String plain = service.decrypt(request.getIv(), request.getCiphertext());
            return ResponseEntity.ok(new DecryptionResponse(plain));
        } catch (AEADBadTagException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(AUTH_FAILED_MSG));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Decryption failed"));
        }
    }

    @ExceptionHandler(AEADBadTagException.class)
    public ResponseEntity<ErrorResponse> handleBadTagException(AEADBadTagException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(AUTH_FAILED_MSG));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }
}
