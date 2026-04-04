package com.MediBook.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.MediBook.backend.dto.DoctorRequest;
import com.MediBook.backend.dto.DoctorResponse;
import com.MediBook.backend.model.Department;
import com.MediBook.backend.model.Doctor;
import com.MediBook.backend.model.User;
import com.MediBook.backend.repository.DoctorRepository;
import com.MediBook.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DepartmentService departmentService;

    public Doctor create(DoctorRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Department department = departmentService.getById(request.getDepartmentId());

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setDepartment(department);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getByDepartment(Long departmentId) {
        Department department = departmentService.getById(departmentId);
        return doctorRepository.findByDepartment(department);
    }

    public DoctorResponse toResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setName(doctor.getUser().getName());
        response.setEmail(doctor.getUser().getEmail());
        response.setSpecialization(doctor.getSpecialization());
        response.setPhone(doctor.getPhone());
        response.setDepartmentName(doctor.getDepartment().getName());
        return response;
    }

    public List<DoctorResponse> getAllAsResponse() {
        return doctorRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DoctorResponse> getByDepartmentAsResponse(Long departmentId) {
        Department department = departmentService.getById(departmentId);
        return doctorRepository.findByDepartment(department)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
