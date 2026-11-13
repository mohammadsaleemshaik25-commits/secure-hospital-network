package com.hospital.network.dto;

public class CrcVerifyRequest {
    private String data;
    private String crc;

    public CrcVerifyRequest() {}
    public CrcVerifyRequest(String data, String crc) { this.data = data; this.crc = crc; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    public String getCrc() { return crc; }
    public void setCrc(String crc) { this.crc = crc; }
}

