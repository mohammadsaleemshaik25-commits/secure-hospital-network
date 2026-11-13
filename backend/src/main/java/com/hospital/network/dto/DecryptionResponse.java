package com.hospital.network.dto;

public class DecryptionResponse {
    private String plaintext;

    public DecryptionResponse() {}
    public DecryptionResponse(String plaintext) { this.plaintext = plaintext; }
    public String getPlaintext() { return plaintext; }
    public void setPlaintext(String plaintext) { this.plaintext = plaintext; }
}

