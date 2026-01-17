package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FileUploadRequest {
    private String fileName;
    private Long fileSize;
    private String fileHash;
    private String chunkNumber;
    private String totalChunks;
    private String uploadId;
    private String parentFolderId;
}