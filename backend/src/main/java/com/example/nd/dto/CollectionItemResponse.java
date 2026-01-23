package com.example.nd.dto;

import lombok.Data;

@Data
public class CollectionItemResponse {
    private Long id;
    private Long collectionId;
    private Long fileId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String mimeType;
    private Integer orderIndex;
    private String itemType;
    private String metadata;
}
