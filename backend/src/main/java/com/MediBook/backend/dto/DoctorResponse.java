package com.MediBook.backend.dto;

import lombok.Data;

@Data
public class DoctorResponse {

    private Long id;
    private String name;
    private String email;
    private String specialization;
    private String phone;
    private String departmentName;
}
