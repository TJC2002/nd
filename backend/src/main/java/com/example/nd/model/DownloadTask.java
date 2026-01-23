package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class DownloadTask {
    private Long id;
    private Long userId;
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
