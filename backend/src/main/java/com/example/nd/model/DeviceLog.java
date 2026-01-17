package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class DeviceLog {
    private Long id;
    private Long userId;
    private Long deviceId;
    private String loginIp;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private String status;
}