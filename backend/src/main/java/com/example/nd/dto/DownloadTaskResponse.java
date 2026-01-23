package com.example.nd.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DownloadTaskResponse {
    private Long id;
    private String taskName;
    private String downloadUrl;
    private String downloadType;
    private String fileName;
    private Long fileSize;
    private String savePath;
    private String status;
    private Integer progress;
    private String downloadSpeed;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
