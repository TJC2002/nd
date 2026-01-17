package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateStorageNodeRequest {
    private String nodeName;
    private String storageType;
    private String storagePath;
    private Long capacity;
}