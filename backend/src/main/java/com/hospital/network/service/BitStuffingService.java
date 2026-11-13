package com.hospital.network.service;

/**
 * Service implementing bit stuffing and destuffing for binary data.
 *
 * <p>Encoding rules (bit stuffing):</p>
 * <ul>
 *   <li>Input must contain only characters '0' and '1'.</li>
 *   <li>Whenever five consecutive '1' bits are encountered, a '0' is inserted after them.</li>
 *   <li>All other bits are copied unchanged.</li>
 * </ul>
 *
 * <p>Decoding (destuffing) reverses the process:</p>
 * <ul>
 *   <li>Read bits, counting consecutive '1's.</li>
 *   <li>After a sequence of exactly five '1's, the next bit must be a stuffed '0'.
 *       That '0' is discarded and the count resets.</li>
 *   <li>If the bit after five '1's is not '0', the frame is malformed.</li>
 * </ul>
 */
import org.springframework.stereotype.Service;

@Service
public class BitStuffingService {

    /** Encode (stuff) a binary string. */
    public String encode(String data) {
        validateBinary(data);
        StringBuilder sb = new StringBuilder();
        int consecutiveOnes = 0;
        for (char c : data.toCharArray()) {
            sb.append(c);
            if (c == '1') {
                consecutiveOnes++;
                if (consecutiveOnes == 5) {
                    // insert a 0 after five 1s
                    sb.append('0');
                    consecutiveOnes = 0; // reset count after stuffing
                }
            } else { // c == '0'
                consecutiveOnes = 0;
            }
        }
        return sb.toString();
    }

    /** Decode (destuff) a stuffed binary string back to original. */
    public String decode(String stuffed) {
        validateBinary(stuffed);
        StringBuilder sb = new StringBuilder();
        int consecutiveOnes = 0;
        for (int i = 0; i < stuffed.length(); i++) {
            char c = stuffed.charAt(i);
            sb.append(c);
            if (c == '1') {
                consecutiveOnes++;
                if (consecutiveOnes == 5) {
                    // next bit must be a stuffed 0
                    i++; // move to next bit
                    if (i >= stuffed.length() || stuffed.charAt(i) != '0') {
                        throw new IllegalArgumentException("Malformed stuffed data: expected 0 after five consecutive 1s");
                    }
                    // Discard the stuffed 0 (do not append to sb)
                    // Reset count after handling stuffed sequence
                    consecutiveOnes = 0;
                }
            } else { // c == '0'
                consecutiveOnes = 0;
            }
        }
        return sb.toString();
    }

    /** Helper to ensure only 0 and 1 characters are present. */
    private void validateBinary(String s) {
        if (s == null) {
            throw new IllegalArgumentException("Input must not be null");
        }
        for (char c : s.toCharArray()) {
            if (c != '0' && c != '1') {
                throw new IllegalArgumentException("Binary input must contain only '0' and '1'");
            }
        }
    }
}
