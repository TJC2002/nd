package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CheckFileResponse {
    private Boolean exist;
    private String fileId;

    public CheckFileResponse(Boolean exist, String fileId) {
        this.exist = exist;
        this.fileId = fileId;
    }
}
