package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class SearchRequest {
    private String keyword;
    private String fileType;
    private Long minSize;
    private Long maxSize;
    private Long folderId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String sortBy;
    private String sortOrder;
    private Integer page;
    private Integer pageSize;
    private Integer offset; // 计算好的偏移量
}