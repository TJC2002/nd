package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskSubmitRequest {
    private Long fileId;
    private String taskType;
    private String taskParams;
}
