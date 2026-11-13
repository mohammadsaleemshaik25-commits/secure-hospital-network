package com.hospital.network.service;

import com.hospital.network.model.Department;
import com.hospital.network.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {
    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    public List<Department> getAllDepartments() {
        return repository.findAll();
    }

    public Optional<Department> getByName(String name) {
        return repository.findByName(name);
    }

    public Department save(Department department) {
        return repository.save(department);
    }
}

