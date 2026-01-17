package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FileDownloadRequest {
    private Long fileId;
    private String versionId;
}