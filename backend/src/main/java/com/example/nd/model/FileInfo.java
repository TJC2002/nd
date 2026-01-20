package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class FileInfo {
    private Long id;
    private Long userId;
    private Long parentFolderId;
    private String fileName;
    private String originalName;
    private Long fileSize;
    private String mimeType;
    private String fileHash;
    private String storagePath;
    private String storageType;
    private Long version;
    private Boolean isDeleted;
    private Boolean isFolder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}