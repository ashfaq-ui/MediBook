package com.MediBook.backend.controller;

import com.MediBook.backend.dto.DoctorRequest;
import com.MediBook.backend.dto.DoctorResponse;
import com.MediBook.backend.model.Doctor;
import com.MediBook.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<DoctorResponse> create(@RequestBody DoctorRequest request) {
        Doctor doctor = doctorService.create(request);
        return ResponseEntity.ok(doctorService.toResponse(doctor));
    }

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAll() {
        return ResponseEntity.ok(doctorService.getAllAsResponse());
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<DoctorResponse>> getByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(doctorService.getByDepartmentAsResponse(departmentId));
    }
}
