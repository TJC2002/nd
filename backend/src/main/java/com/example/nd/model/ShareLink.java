package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ShareLink {
    private Long id;
    private Long userId;
    private Long fileId;
    private String shareCode;
    private String password;
    private LocalDateTime expireTime;
    private Long accessCount;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}