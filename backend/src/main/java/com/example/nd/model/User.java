package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class User {
    private Long id;
    private String username;
    private String passwordHash;
    private String email;
    private String phone;
    private Long totalSpace;
    private Long usedSpace;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
}