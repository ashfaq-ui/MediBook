package com.MediBook.backend.controller;

import com.MediBook.backend.dto.AppointmentRequest;
import com.MediBook.backend.dto.AppointmentResponse;
import com.MediBook.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> book(@RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.book(request));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getByDoctor(doctorId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancel(id));
    }
}
