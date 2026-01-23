package com.example.nd.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CollectionResponse {
    private Long id;
    private String name;
    private String type;
    private String description;
    private String author;
    private String coverImage;
    private LocalDateTime createdAt;
    private Long parentId;
    private Integer itemCount;
}
