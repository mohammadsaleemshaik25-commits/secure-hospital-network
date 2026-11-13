package com.hospital.network.dto;

/**
 * DTO representing a weighted edge between two nodes.
 */
public class EdgeDto {
    private String source;
    private String target;
    private int weight;

    public EdgeDto() {}

    public EdgeDto(String source, String target, int weight) {
        this.source = source;
        this.target = target;
        this.weight = weight;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }
}

