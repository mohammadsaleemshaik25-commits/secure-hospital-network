package com.hospital.network.dto;

public class CrcCalculateResponse {
    private String crc;

    public CrcCalculateResponse() {}
    public CrcCalculateResponse(String crc) { this.crc = crc; }
    public String getCrc() { return crc; }
    public void setCrc(String crc) { this.crc = crc; }
}

