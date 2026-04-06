package com.MediBook.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Data;

@Data
public class AppointmentResponse {

    private Long id;
    private String patientName;
    private String doctorName;
    private String departmentName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
}
