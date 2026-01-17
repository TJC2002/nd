package com.example.nd.service;

import com.example.nd.dto.*;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {
    
    FileInfo uploadFile(Long userId, MultipartFile file, Long parentFolderId);
    
    FileInfo getFileById(Long fileId);
    
    List<FileInfo> getFilesByFolderId(Long folderId);
    
    List<FileInfo> getFilesByUserId(Long userId);
    
    void deleteFile(Long fileId);
    
    void moveFile(Long fileId, Long targetFolderId);
    
    void renameFile(Long fileId, String newName);
    
    FileInfo downloadFile(Long fileId);
}