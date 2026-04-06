package com.MediBook.backend.dto;

import lombok.Data;

@Data
public class AppointmentRequest {

    private Long patientId;
    private Long doctorId;
    private Long slotId;
}
