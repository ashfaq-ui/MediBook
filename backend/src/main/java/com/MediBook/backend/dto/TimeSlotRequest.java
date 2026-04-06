package com.MediBook.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class TimeSlotRequest {

    private Long doctorId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
}
