package com.example.nd.mapper;

import com.example.nd.dto.FileUploadRequest;
import com.example.nd.model.File;
import org.apache.ibatis.annotations.Mapper;

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
}