package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UploadCompleteRequest {
    private String uploadId;
    private String fileName;
    private String hash;
}
