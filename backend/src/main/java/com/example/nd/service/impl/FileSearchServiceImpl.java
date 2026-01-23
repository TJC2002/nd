package com.example.nd.service.impl;

import com.example.nd.dto.SearchRequest;
import com.example.nd.dto.SearchResult;
import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;
import com.example.nd.service.FileSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileSearchServiceImpl implements FileSearchService {

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    @Override
    public List<SearchResult> searchFiles(Long userId, SearchRequest request) {
        List<File> files = fileMapper.searchFiles(userId, request);
        List<SearchResult> results = new ArrayList<>();
        
        for (File file : files) {
            SearchResult result = convertToSearchResult(file);
            results.add(result);
        }
        
        return results;
    }

    private SearchResult convertToSearchResult(File file) {
        SearchResult result = new SearchResult();
        result.setId(file.getId());
        result.setUserId(file.getUserId());
        result.setParentFolderId(file.getParentId());
        result.setFileName(file.getName());
        result.setIsFolder(file.getIsFolder());
        result.setCreatedAt(file.getCreatedAt() != null ? file.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : null);
        result.setUpdatedAt(file.getUpdatedAt() != null ? file.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : null);
        
        result.setFileSize(file.getSize());
        result.setMimeType(file.getMimeType());
        result.setFileHash(file.getHashValue());
        result.setStoragePath(file.getStoragePath());
        
        return result;
    }
}