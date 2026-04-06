package com.MediBook.backend.service;

import com.MediBook.backend.dto.AppointmentRequest;
import com.MediBook.backend.dto.AppointmentResponse;
import com.MediBook.backend.enums.AppointmentStatus;
import com.MediBook.backend.model.Appointment;
import com.MediBook.backend.model.Doctor;
import com.MediBook.backend.model.TimeSlot;
import com.MediBook.backend.model.User;
import com.MediBook.backend.repository.AppointmentRepository;
import com.MediBook.backend.repository.DoctorRepository;
import com.MediBook.backend.repository.TimeSlotRepository;
import com.MediBook.backend.repository.UserRepository;
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
    private final EmailService emailService;  // ← ADD THIS

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

        slot.setBooked(true);
        timeSlotRepository.save(slot);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.PENDING);

        AppointmentResponse response = toResponse(appointmentRepository.save(appointment));

        // Send confirmation email
        emailService.sendBookingConfirmation(
                patient.getEmail(),
                patient.getName(),
                doctor.getUser().getName(),
                doctor.getDepartment().getName(),
                slot.getDate().toString(),
                slot.getStartTime().toString(),
                slot.getEndTime().toString()
        );

        return response;
    }

    public AppointmentResponse cancel(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        TimeSlot slot = appointment.getSlot();
        slot.setBooked(false);
        timeSlotRepository.save(slot);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        AppointmentResponse response = toResponse(appointmentRepository.save(appointment));

        // Send cancellation email
        emailService.sendCancellationEmail(
                appointment.getPatient().getEmail(),
                appointment.getPatient().getName(),
                appointment.getDoctor().getUser().getName(),
                slot.getDate().toString(),
                slot.getStartTime().toString()
        );

        return response;
    }

    public AppointmentResponse updateStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        AppointmentResponse response = toResponse(appointmentRepository.save(appointment));

        // Send status update email
        emailService.sendStatusUpdateEmail(
                appointment.getPatient().getEmail(),
                appointment.getPatient().getName(),
                appointment.getDoctor().getUser().getName(),
                appointment.getSlot().getDate().toString(),
                appointment.getSlot().getStartTime().toString(),
                status.toUpperCase()
        );

        return response;
    }

    // Keep all other methods the same
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

    public List<AppointmentResponse> getAll() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
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
