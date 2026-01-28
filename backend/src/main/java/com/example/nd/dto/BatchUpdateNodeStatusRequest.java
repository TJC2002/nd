package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class BatchUpdateNodeStatusRequest {
    private List<Long> nodeIds;
    private String status;
}
