package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class MediaCollection {
    private Long id;
    private Long userId;
    private String name;
    private String type;
    private String description;
    private String author;
    private String coverImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long parentId;
}