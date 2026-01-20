package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UploadTask {
    private Long id;
    private String uploadId;
    private Long userId;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private String fileHash;
    private Long chunkSize;
    private Integer totalChunks;
    private String uploadedChunks;
    private String status;
    private String tempPath;
    private Long parentFolderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
