package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SearchResult {
    private Long id;
    private Long userId;
    private Long parentFolderId;
    private String fileName;
    private Boolean isFolder;
    private Long fileSize;
    private String mimeType;
    private String fileHash;
    private String storagePath;
    private String coverPath;
    private String createdAt;
    private String updatedAt;
}