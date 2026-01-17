package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ShareStatsResponse {
    private Long totalShares;
    private Long totalAccessCount;
}