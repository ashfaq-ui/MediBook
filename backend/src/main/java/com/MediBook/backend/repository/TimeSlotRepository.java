package com.MediBook.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.MediBook.backend.model.Doctor;
import com.MediBook.backend.model.TimeSlot;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDoctorAndDateAndBookedFalse(Doctor doctor, LocalDate date);

    List<TimeSlot> findByDoctorAndBooked(Doctor doctor, boolean booked);
}
