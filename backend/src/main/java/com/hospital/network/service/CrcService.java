package com.hospital.network.service;

/**
 * Service providing CRC‑16‑CCITT (FALSE) and CRC‑32 (IEEE) calculations and verification.
 *
 * <p>CRC‑16‑CCITT‑FALSE parameters:
 *   <ul>
 *     <li>Polynomial 0x1021</li>
 *     <li>Initial value 0xFFFF</li>
 *     <li>No input reflection</li>
 *     <li>No output reflection</li>
 *     <li>Final XOR 0x0000</li>
 *   </ul>
 * </p>
 *
 * <p>CRC‑32 uses {@link java.util.zip.CRC32} which implements the standard IEEE algorithm
 * (polynomial 0x04C11DB7, reflected, init 0xFFFFFFFF, final XOR 0xFFFFFFFF).</p>
 */
import org.springframework.stereotype.Service;

@Service
public class CrcService {

    // ---------- CRC‑16‑CCITT‑FALSE ----------
    private static final int CRC16_POLY = 0x1021;
    private static final int CRC16_INIT = 0xFFFF;
    private static final int CRC16_FINAL_XOR = 0x0000;

    /**
     * Calculates CRC‑16‑CCITT‑FALSE over the UTF‑8 bytes of {@code data}.
     * @return 4‑character upper‑case hexadecimal string.
     */
    public String calculateCrc16(String data) {
        if (data == null) {
            throw new IllegalArgumentException("Message must not be null");
        }
        byte[] bytes = data.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        int crc = CRC16_INIT;
        for (byte b : bytes) {
            crc ^= (b & 0xFF) << 8;
            for (int i = 0; i < 8; i++) {
                if ((crc & 0x8000) != 0) {
                    crc = (crc << 1) ^ CRC16_POLY;
                } else {
                    crc <<= 1;
                }
                crc &= 0xFFFF; // keep 16‑bit
            }
        }
        crc ^= CRC16_FINAL_XOR;
        return String.format("%04X", crc);
    }

    /** Verify a CRC‑16 value against the supplied message. */
    public boolean verifyCrc16(String data, String crcHex) {
        if (data == null || crcHex == null) {
            throw new IllegalArgumentException("Message and CRC must be provided");
        }
        String calc = calculateCrc16(data);
        return calc.equalsIgnoreCase(crcHex.trim());
    }

    // ---------- CRC‑32 (IEEE) ----------
    /**
     * Calculates CRC‑32 (IEEE) over the UTF‑8 bytes of {@code data}.
     * @return 8‑character upper‑case hexadecimal string.
     */
    public String calculateCrc32(String data) {
        if (data == null) {
            throw new IllegalArgumentException("Message must not be null");
        }
        java.util.zip.CRC32 crc32 = new java.util.zip.CRC32();
        byte[] bytes = data.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        crc32.update(bytes, 0, bytes.length);
        long value = crc32.getValue(); // already final XORed
        return String.format("%08X", value);
    }

    /** Verify a CRC‑32 value against the supplied message. */
    public boolean verifyCrc32(String data, String crcHex) {
        if (data == null || crcHex == null) {
            throw new IllegalArgumentException("Message and CRC must be provided");
        }
        String calc = calculateCrc32(data);
        return calc.equalsIgnoreCase(crcHex.trim());
    }
}
