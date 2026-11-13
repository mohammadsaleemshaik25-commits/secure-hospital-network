package com.hospital.network;

import com.hospital.network.model.Department;
import com.hospital.network.repository.DepartmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(DepartmentRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<Department> departments = List.of(
                        new Department(null, "Reception", "192.168.10.10", "255.255.255.0", "192.168.10.1", "192.168.10.0/24", "ONLINE"),
                        new Department(null, "Emergency", "192.168.20.10", "255.255.255.0", "192.168.20.1", "192.168.20.0/24", "ONLINE"),
                        new Department(null, "ICU", "192.168.30.10", "255.255.255.0", "192.168.30.1", "192.168.30.0/24", "ONLINE"),
                        new Department(null, "Pharmacy", "192.168.40.10", "255.255.255.0", "192.168.40.1", "192.168.40.0/24", "ONLINE"),
                        new Department(null, "Laboratory", "192.168.50.10", "255.255.255.0", "192.168.50.1", "192.168.50.0/24", "ONLINE"),
                        new Department(null, "Doctors' Rooms", "192.168.60.10", "255.255.255.0", "192.168.60.1", "192.168.60.0/24", "ONLINE"),
                        new Department(null, "Medical Server", "192.168.70.10", "255.255.255.0", "192.168.70.1", "192.168.70.0/24", "ONLINE"),
                        new Department(null, "Administration", "192.168.80.10", "255.255.255.0", "192.168.80.1", "192.168.80.0/24", "ONLINE")
                );
                repository.saveAll(departments);
                System.out.println("Initialized department data.");
            }
        };
    }
}

