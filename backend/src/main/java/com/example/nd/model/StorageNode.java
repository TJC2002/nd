package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class StorageNode {
    private Long id;
    private String nodeName;
    private String storageType;
    private String storagePath;
    private String connectionConfig;
    private Long capacity;
    private Long usedSpace;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}