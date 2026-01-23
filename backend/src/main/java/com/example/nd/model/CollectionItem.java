package com.example.nd.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CollectionItem {
    private Long id;
    private Long collectionId;
    private Long fileId;
    private Integer orderIndex;
    private String itemType;
    private String metadata;
}
