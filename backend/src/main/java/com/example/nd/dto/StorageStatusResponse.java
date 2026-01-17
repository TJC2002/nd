package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StorageStatusResponse {
    private Long totalCapacity;
    private Long totalUsedSpace;
    private Long availableSpace;
    private Long nodeCount;
}