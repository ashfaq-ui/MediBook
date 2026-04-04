package com.MediBook.backend.dto;

import lombok.Data;

@Data
public class DoctorRequest {

    private Long userId;
    private Long departmentId;
    private String specialization;
    private String phone;
}
