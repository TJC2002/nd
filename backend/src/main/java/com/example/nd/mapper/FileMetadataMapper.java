package com.example.nd.mapper;

import com.example.nd.model.FileMetadata;

public interface FileMetadataMapper {
    FileMetadata getFileMetadataByHash(String hashValue);
    FileMetadata getFileMetadataById(Long id);
    void insertFileMetadata(FileMetadata fileMetadata);
    void updateReferenceCount(Long id, Integer increment);
    void updateFileMetadata(FileMetadata fileMetadata);
    void deleteFileMetadata(Long id);
}