package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskResponse {
    private Long taskId;
    private String taskType;
    private String status;
    private Integer progress;
    private String message;
    private String resultData;
    private String errorDetails;
    private String createdAt;
    private String updatedAt;
    private String startedAt;
    private String completedAt;
}
