package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SearchRequest {
    private String keyword;
    private String fileType;
    private Long minSize;
    private Long maxSize;
    private Long folderId;
    private String sortBy;
    private String sortOrder;
    private Integer page;
    private Integer pageSize;
}