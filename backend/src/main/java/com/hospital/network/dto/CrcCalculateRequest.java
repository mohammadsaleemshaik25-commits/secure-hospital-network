package com.hospital.network.dto;

public class CrcCalculateRequest {
    private String data;

    public CrcCalculateRequest() {}
    public CrcCalculateRequest(String data) { this.data = data; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}

