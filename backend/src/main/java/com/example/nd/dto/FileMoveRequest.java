package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FileMoveRequest {
    private Long fileId;
    private Long targetFolderId;
}