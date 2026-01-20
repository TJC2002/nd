package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UploadInitResponse {
    private String uploadId;
    private Long chunkSize;
    private String storageNode;

    public UploadInitResponse(String uploadId, Long chunkSize, String storageNode) {
        this.uploadId = uploadId;
        this.chunkSize = chunkSize;
        this.storageNode = storageNode;
    }
}
