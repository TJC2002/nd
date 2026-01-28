package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UploadPolicy {
    private Long id;
    private Long userId;
    private String policyName;
    private String ruleType;
    private String ruleValue;
    private Long minSize;
    private Long maxSize;
    private Long storageNodeId;
    private Integer priority;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
