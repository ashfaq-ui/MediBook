package com.MediBook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.MediBook.backend.model.Appointment;
import com.MediBook.backend.model.Doctor;
import com.MediBook.backend.model.User;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(User patient);

    List<Appointment> findByDoctor(Doctor doctor);
}
