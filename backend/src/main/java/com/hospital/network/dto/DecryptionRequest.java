package com.hospital.network.dto;

public class DecryptionRequest {
    private String iv;
    private String ciphertext;

    public DecryptionRequest() {}
    public DecryptionRequest(String iv, String ciphertext) {
        this.iv = iv;
        this.ciphertext = ciphertext;
    }
    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }
    public String getCiphertext() { return ciphertext; }
    public void setCiphertext(String ciphertext) { this.ciphertext = ciphertext; }
}

