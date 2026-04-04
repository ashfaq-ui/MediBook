package com.MediBook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.MediBook.backend.model.Department;
import com.MediBook.backend.model.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByDepartment(Department department);
}
