package com.hospital.network.dto;

public class CrcVerifyResponse {
    private boolean valid;
    private String message;

    public CrcVerifyResponse() {}
    public CrcVerifyResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

