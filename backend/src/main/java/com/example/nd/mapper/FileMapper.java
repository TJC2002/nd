package com.example.nd.mapper;

import com.example.nd.dto.FileUploadRequest;
import com.example.nd.dto.SearchRequest;
import com.example.nd.model.File;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface FileMapper {
    
    File getFileById(Long id);
    
    List<File> getFilesByFolderId(Long folderId);
    
    List<File> getFilesByUserId(Long userId);
    
    int insertFile(File file);
    
    int updateFile(File file);
    
    int deleteFile(Long fileId);
    
    File getFileByHash(String fileHash);
    
    int updateFileVersion(Long fileId, Long version);

    List<File> getDeletedFilesByUserId(Long userId);

    int restoreFile(Long fileId);

    int deleteFilePermanently(Long fileId);

    int deleteFilesPermanentlyByUserId(Long userId);

    int cleanExpiredFiles(LocalDateTime expireTime);

    List<File> searchFiles(Long userId, SearchRequest request);
}