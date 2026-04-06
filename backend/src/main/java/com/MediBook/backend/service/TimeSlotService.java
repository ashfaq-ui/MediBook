package com.MediBook.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.MediBook.backend.dto.TimeSlotRequest;
import com.MediBook.backend.dto.TimeSlotResponse;
import com.MediBook.backend.model.Doctor;
import com.MediBook.backend.model.TimeSlot;
import com.MediBook.backend.repository.DoctorRepository;
import com.MediBook.backend.repository.TimeSlotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final DoctorRepository doctorRepository;

    public TimeSlotResponse create(TimeSlotRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        TimeSlot slot = new TimeSlot();
        slot.setDoctor(doctor);
        slot.setDate(request.getDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setBooked(false);

        return toResponse(timeSlotRepository.save(slot));
    }

    public List<TimeSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return timeSlotRepository
                .findByDoctorAndDateAndBookedFalse(doctor, date)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TimeSlotResponse toResponse(TimeSlot slot) {
        TimeSlotResponse response = new TimeSlotResponse();
        response.setId(slot.getId());
        response.setDoctorId(slot.getDoctor().getId());
        response.setDoctorName(slot.getDoctor().getUser().getName());
        response.setDate(slot.getDate());
        response.setStartTime(slot.getStartTime());
        response.setEndTime(slot.getEndTime());
        response.setBooked(slot.isBooked());
        return response;
    }
}
