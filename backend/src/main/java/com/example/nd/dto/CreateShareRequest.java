package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateShareRequest {
    private Long fileId;
    private String password;
    private Long expireDays;
}