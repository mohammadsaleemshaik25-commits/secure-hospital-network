package com.hospital.network.controller;

import com.hospital.network.dto.*;
import com.hospital.network.service.CrcService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crc")
public class CrcController {
    private final CrcService crcService;

    public CrcController(CrcService crcService) {
        this.crcService = crcService;
    }

    // ----- CRC-16 -----
    @PostMapping("/crc16/calculate")
    public ResponseEntity<CrcCalculateResponse> calculateCrc16(@RequestBody CrcCalculateRequest req) {
        if (req == null || req.getData() == null) {
            return ResponseEntity.badRequest().build();
        }
        String crc = crcService.calculateCrc16(req.getData());
        return ResponseEntity.ok(new CrcCalculateResponse(crc));
    }

    @PostMapping("/crc16/verify")
    public ResponseEntity<CrcVerifyResponse> verifyCrc16(@RequestBody CrcVerifyRequest req) {
        if (req == null || req.getData() == null || req.getCrc() == null) {
            return ResponseEntity.badRequest().body(new CrcVerifyResponse(false, "Message and CRC must be provided"));
        }
        boolean ok = crcService.verifyCrc16(req.getData(), req.getCrc());
        String msg = ok ? "Valid CRC‑16" : "Invalid CRC‑16";
        return ResponseEntity.ok(new CrcVerifyResponse(ok, msg));
    }

    // ----- CRC-32 -----
    @PostMapping("/crc32/calculate")
    public ResponseEntity<CrcCalculateResponse> calculateCrc32(@RequestBody CrcCalculateRequest req) {
        if (req == null || req.getData() == null) {
            return ResponseEntity.badRequest().build();
        }
        String crc = crcService.calculateCrc32(req.getData());
        return ResponseEntity.ok(new CrcCalculateResponse(crc));
    }

    @PostMapping("/crc32/verify")
    public ResponseEntity<CrcVerifyResponse> verifyCrc32(@RequestBody CrcVerifyRequest req) {
        if (req == null || req.getData() == null || req.getCrc() == null) {
            return ResponseEntity.badRequest().body(new CrcVerifyResponse(false, "Message and CRC must be provided"));
        }
        boolean ok = crcService.verifyCrc32(req.getData(), req.getCrc());
        String msg = ok ? "Valid CRC‑32" : "Invalid CRC‑32";
        return ResponseEntity.ok(new CrcVerifyResponse(ok, msg));
    }
}

