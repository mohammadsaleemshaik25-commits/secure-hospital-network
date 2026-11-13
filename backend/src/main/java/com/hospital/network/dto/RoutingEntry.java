package com.hospital.network.dto;

/**
 * Represents a single routing entry in a node's distance‑vector table.
 */
public class RoutingEntry {
    private String destination;
    private String nextHop; // may be null for unreachable
    private int totalCost; // -1 means unreachable

    public RoutingEntry() {}

    public RoutingEntry(String destination, String nextHop, int totalCost) {
        this.destination = destination;
        this.nextHop = nextHop;
        this.totalCost = totalCost;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getNextHop() {
        return nextHop;
    }

    public void setNextHop(String nextHop) {
        this.nextHop = nextHop;
    }

    public int getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(int totalCost) {
        this.totalCost = totalCost;
    }
}

