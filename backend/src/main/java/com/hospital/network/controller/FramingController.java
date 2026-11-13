package com.hospital.network.controller;

import com.hospital.network.dto.*;
import com.hospital.network.service.CharacterStuffingService;
import com.hospital.network.service.BitStuffingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/framing")
public class FramingController {
    private final CharacterStuffingService characterService;
    private final BitStuffingService bitService;

    public FramingController(CharacterStuffingService characterService, BitStuffingService bitService) {
        this.characterService = characterService;
        this.bitService = bitService;
    }

    // Character stuffing endpoints
    @PostMapping("/character-stuffing/encode")
    public ResponseEntity<?> encodeCharacter(@RequestBody CharacterStuffingRequest req) {
        if (req == null || req.getData() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Data must be provided"));
        }
        String encoded = characterService.encode(req.getData());
        return ResponseEntity.ok(new CharacterStuffingResponse(encoded));
    }

    @PostMapping("/character-stuffing/decode")
    public ResponseEntity<?> decodeCharacter(@RequestBody CharacterStuffingRequest req) {
        if (req == null || req.getData() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Frame must be provided"));
        }
        try {
            String decoded = characterService.decode(req.getData());
            return ResponseEntity.ok(new CharacterStuffingResponse(decoded));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Bit stuffing endpoints
    @PostMapping("/bit-stuffing/encode")
    public ResponseEntity<?> encodeBit(@RequestBody BitStuffingRequest req) {
        if (req == null || req.getData() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Binary data must be provided"));
        }
        try {
            String encoded = bitService.encode(req.getData());
            return ResponseEntity.ok(new BitStuffingResponse(encoded));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/bit-stuffing/decode")
    public ResponseEntity<?> decodeBit(@RequestBody BitStuffingRequest req) {
        if (req == null || req.getData() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Binary data must be provided"));
        }
        try {
            String decoded = bitService.decode(req.getData());
            return ResponseEntity.ok(new BitStuffingResponse(decoded));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
}

