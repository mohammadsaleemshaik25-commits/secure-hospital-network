package com.hospital.network.dto;

public class EncryptionRequest {
    private String plaintext;

    public EncryptionRequest() {}
    public EncryptionRequest(String plaintext) { this.plaintext = plaintext; }
    public String getPlaintext() { return plaintext; }
    public void setPlaintext(String plaintext) { this.plaintext = plaintext; }
}

