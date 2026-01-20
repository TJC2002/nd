package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class File {
    private Long id;
    private Long userId;
    private Long parentId;
    private Long metadataId;
    private String name;
    private Boolean isFolder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}