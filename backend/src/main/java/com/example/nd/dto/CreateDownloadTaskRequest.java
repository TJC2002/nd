package com.example.nd.dto;

import lombok.Data;

@Data
public class CreateDownloadTaskRequest {
    private String taskName;
    private String downloadUrl;
    private String downloadType;
    private String fileName;
    private Long fileSize;
    private String savePath;
}
