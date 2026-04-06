package com.MediBook.backend.service;

import com.MediBook.backend.dto.AppointmentRequest;
import com.MediBook.backend.dto.AppointmentResponse;
import com.MediBook.backend.enums.AppointmentStatus;
import com.MediBook.backend.model.*;
import com.MediBook.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final TimeSlotRepository timeSlotRepository;

    public AppointmentResponse book(AppointmentRequest request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        TimeSlot slot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.isBooked()) {
            throw new RuntimeException("Slot already booked");
        }

        // Mark slot as booked
        slot.setBooked(true);
        timeSlotRepository.save(slot);

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.PENDING);

        return toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> getByPatient(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return appointmentRepository.findByPatient(patient)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AppointmentResponse> getByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return appointmentRepository.findByDoctor(doctor)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AppointmentResponse updateStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse cancel(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Free up the slot
        TimeSlot slot = appointment.getSlot();
        slot.setBooked(false);
        timeSlotRepository.save(slot);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setPatientName(appointment.getPatient().getName());
        response.setDoctorName(appointment.getDoctor().getUser().getName());
        response.setDepartmentName(appointment.getDoctor().getDepartment().getName());
        response.setDate(appointment.getSlot().getDate());
        response.setStartTime(appointment.getSlot().getStartTime());
        response.setEndTime(appointment.getSlot().getEndTime());
        response.setStatus(appointment.getStatus().name());
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());
        return response;
    }
}
