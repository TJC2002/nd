package com.example.nd.service;

import com.example.nd.dto.SearchRequest;
import com.example.nd.dto.SearchResult;

import java.util.List;

public interface FileSearchService {
    List<SearchResult> searchFiles(Long userId, SearchRequest request);
}