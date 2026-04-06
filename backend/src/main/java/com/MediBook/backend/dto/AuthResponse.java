package com.MediBook.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String role;
    private String name;
    private Long userId;
    private String email;
}
