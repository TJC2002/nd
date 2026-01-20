package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UploadInitRequest {
    private String name;
    private Long size;
    private String type;
    private String hash;
    private Long chunkSize;
    private Integer totalChunks;
    private Long parentFolderId;
}
