package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class FileMetadata {
    private Long id;
    private String hashValue;
    private Long size;
    private String mimeType;
    private Long storageNodeId;
    private String storagePath;
    private String coverPath;
    private Integer referenceCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}