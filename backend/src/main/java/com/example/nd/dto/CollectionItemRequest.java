package com.example.nd.dto;

import lombok.Data;

@Data
public class CollectionItemRequest {
    private Long fileId;
    private Integer orderIndex;
    private String itemType;
    private String metadata;
}
