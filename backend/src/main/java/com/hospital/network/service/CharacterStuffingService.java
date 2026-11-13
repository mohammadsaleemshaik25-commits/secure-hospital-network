package com.hospital.network.service;

/**
 * Service implementing character stuffing (frame encoding) and destuffing.
 *
 * <p>Protocol definition:</p>
 * <ul>
 *   <li>FLAG  – the frame delimiter (string "FLAG")</li>
 *   <li>ESC   – the escape character (string "ESC")</li>
 *   <li>Encoding:
 *     <ol>
 *       <li>Replace every occurrence of ESC with ESC+ESC.</li>
 *       <li>Replace every occurrence of FLAG with ESC+FLAG.</li>
 *       <li>Wrap the resulting string with FLAG at the start and FLAG at the end.</li>
 *     </ol>
 *   </li>
 *   <li>Decoding:
 *     <ol>
 *       <li>Verify the frame starts and ends with FLAG; otherwise error.</li>
 *       <li>Remove the outer FLAG delimiters.</li>
 *       <li>Process the payload left‑to‑right:
 *         <ul>
 *           <li>If ESC is encountered, the next token must be either FLAG or ESC. The pair is replaced by that token.</li>
 *           <li>Any other character is copied as‑is.</li>
 *         </ul>
 *       </li>
 *       <li>If an ESC is not followed by FLAG or ESC, the frame is malformed.</li>
 *     </ol>
 *   </li>
 * </ul>
 */
import org.springframework.stereotype.Service;

@Service
public class CharacterStuffingService {
    public static final String FLAG = "FLAG";
    public static final String ESC = "ESC";

    /** Encode (stuff) the raw data into a framed string. */
    public String encode(String data) {
        if (data == null) {
            throw new IllegalArgumentException("Input data must not be null");
        }
        // Escape ESC first to avoid double escaping FLAG later.
        String escaped = data.replace(ESC, ESC + ESC)
                .replace(FLAG, ESC + FLAG);
        return FLAG + escaped + FLAG;
    }

    /** Decode (destuff) a framed string back to the original data. */
    public String decode(String frame) {
        if (frame == null) {
            throw new IllegalArgumentException("Frame must not be null");
        }
        if (!frame.startsWith(FLAG) || !frame.endsWith(FLAG)) {
            throw new IllegalArgumentException("Frame must start and end with FLAG delimiter");
        }
        // Strip outer delimiters
        String payload = frame.substring(FLAG.length(), frame.length() - FLAG.length());
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < payload.length();) {
            if (payload.startsWith(ESC, i)) {
                // Check for ESC+FLAG or ESC+ESC
                if (payload.startsWith(ESC + FLAG, i)) {
                    sb.append(FLAG);
                    i += ESC.length() + FLAG.length();
                } else if (payload.startsWith(ESC + ESC, i)) {
                    sb.append(ESC);
                    i += ESC.length() * 2;
                } else {
                    throw new IllegalArgumentException("Invalid escape sequence in frame");
                }
            } else {
                // Normal character – copy one char
                sb.append(payload.charAt(i));
                i++;
            }
        }
        return sb.toString();
    }
}
