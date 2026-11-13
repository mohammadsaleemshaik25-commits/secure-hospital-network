package com.hospital.network.model;

import jakarta.persistence.*;

/**
 * Entity representing a hospital department and its network configuration.
 */
@Entity
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String ipAddress; // e.g., 192.168.10.2

    @Column(nullable = false)
    private String subnetMask; // e.g., 255.255.255.0

    @Column(nullable = false)
    private String gateway; // default gateway for the subnet

    @Column(nullable = false)
    private String networkAddress; // e.g., 192.168.10.0/24

    @Column(nullable = false)
    private String status; // ONLINE/OFFLINE for demo purposes

    // No-args constructor required by JPA
    public Department() {}

    // Constructor without id for easier initialization in DataInitializer
    public Department(String name, String ipAddress, String subnetMask, String gateway, String networkAddress, String status) {
        this.name = name;
        this.ipAddress = ipAddress;
        this.subnetMask = subnetMask;
        this.gateway = gateway;
        this.networkAddress = networkAddress;
        this.status = status;
    }

    // Full constructor (including id) – rarely used but kept for completeness
    public Department(Long id, String name, String ipAddress, String subnetMask, String gateway, String networkAddress, String status) {
        this.id = id;
        this.name = name;
        this.ipAddress = ipAddress;
        this.subnetMask = subnetMask;
        this.gateway = gateway;
        this.networkAddress = networkAddress;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getSubnetMask() { return subnetMask; }
    public void setSubnetMask(String subnetMask) { this.subnetMask = subnetMask; }
    public String getGateway() { return gateway; }
    public void setGateway(String gateway) { this.gateway = gateway; }
    public String getNetworkAddress() { return networkAddress; }
    public void setNetworkAddress(String networkAddress) { this.networkAddress = networkAddress; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
