package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateStorageNodeRequest {
    private String nodeName;
    private String storageType;
    private String storagePath;
    private String connectionConfig;
    private Long capacity;
}
