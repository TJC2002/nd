package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class DownloadChunk {
    private Long id;
    private Long taskId;
    private Integer chunkIndex;
    private Long chunkSize;
    private String chunkPath;
    private String status;
    private LocalDateTime createdAt;
}
