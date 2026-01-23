package com.example.nd.dto;

import lombok.Data;

@Data
public class CollectionRequest {
    private String name;
    private String type;
    private String description;
    private String author;
    private String coverImage;
    private Long parentId;
}
