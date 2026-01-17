package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private Long totalSpace;
    private Long usedSpace;
    private String status;
    private LocalDateTime createdAt;
}
