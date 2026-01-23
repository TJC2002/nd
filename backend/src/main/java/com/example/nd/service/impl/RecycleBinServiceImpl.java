package com.example.nd.service.impl;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import com.example.nd.model.FileMetadata;
import com.example.nd.service.RecycleBinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecycleBinServiceImpl implements RecycleBinService {

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    @Value("${app.recycle-bin.retention-days:30}")
    private int retentionDays;

    @Override
    public List<FileInfo> getRecycleBinFiles(Long userId) {
        List<File> deletedFiles = fileMapper.getDeletedFilesByUserId(userId);
        List<FileInfo> fileInfoList = new ArrayList<>();
        
        for (File file : deletedFiles) {
            FileInfo fileInfo = convertToFileInfo(file);
            fileInfoList.add(fileInfo);
        }
        
        return fileInfoList;
    }

    @Override
    @Transactional
    public void restoreFile(Long userId, Long fileId) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        
        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此文件");
        }
        
        if (file.getDeletedAt() == null) {
            throw new RuntimeException("文件不在回收站中");
        }
        
        fileMapper.restoreFile(fileId);
    }

    @Override
    @Transactional
    public void restoreAllFiles(Long userId) {
        List<File> deletedFiles = fileMapper.getDeletedFilesByUserId(userId);
        for (File file : deletedFiles) {
            fileMapper.restoreFile(file.getId());
        }
    }

    @Override
    @Transactional
    public void deletePermanently(Long userId, Long fileId) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        
        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此文件");
        }
        
        if (file.getDeletedAt() == null) {
            throw new RuntimeException("文件不在回收站中");
        }
        
        fileMapper.deleteFilePermanently(fileId);
    }

    @Override
    @Transactional
    public void deleteAllPermanently(Long userId) {
        List<File> deletedFiles = fileMapper.getDeletedFilesByUserId(userId);
        for (File file : deletedFiles) {
            fileMapper.deleteFilePermanently(file.getId());
        }
    }

    @Override
    @Transactional
    public void emptyRecycleBin(Long userId) {
        deleteAllPermanently(userId);
    }

    @Override
    @Transactional
    public void cleanExpiredFiles() {
        LocalDateTime expireTime = LocalDateTime.now().minusDays(retentionDays);
        fileMapper.cleanExpiredFiles(expireTime);
    }

    private FileInfo convertToFileInfo(File file) {
        FileInfo fileInfo = new FileInfo();
        fileInfo.setId(file.getId());
        fileInfo.setUserId(file.getUserId());
        fileInfo.setParentFolderId(file.getParentId());
        fileInfo.setFileName(file.getName());
        fileInfo.setIsFolder(file.getIsFolder());
        fileInfo.setCreatedAt(file.getCreatedAt());
        fileInfo.setUpdatedAt(file.getUpdatedAt());
        fileInfo.setDeletedAt(file.getDeletedAt());
        
        fileInfo.setFileSize(file.getSize());
        fileInfo.setMimeType(file.getMimeType());
        fileInfo.setFileHash(file.getHashValue());
        fileInfo.setStoragePath(file.getStoragePath());
        
        return fileInfo;
    }
}
