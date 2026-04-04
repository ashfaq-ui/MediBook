package com.MediBook.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.MediBook.backend.dto.DepartmentRequest;
import com.MediBook.backend.model.Department;
import com.MediBook.backend.repository.DepartmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public Department create(DepartmentRequest request) {
        Department department = new Department();
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        return departmentRepository.save(department);
    }

    public List<Department> getAll() {
        return departmentRepository.findAll();
    }

    public Department getById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }
}
