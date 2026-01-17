package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class Device {
    private Long id;
    private Long userId;
    private String deviceName;
    private String deviceType;
    private String deviceIdentifier;
    private String lastLoginIp;
    private LocalDateTime lastLoginTime;
    private String status;
    private LocalDateTime createdAt;
}