package com.example.nd.service;

import com.example.nd.dto.*;
import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.UserMapper;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import com.example.nd.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private StorageService storageService;

    private static final String STORAGE_BASE_PATH = "/storage/";

    @Override
    @Transactional
    public FileInfo uploadFile(Long userId, MultipartFile file, Long parentFolderId) {
        User user = userMapper.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileHash = calculateFileHash(file);
        
        File tempFile = new File();
        tempFile.setUserId(userId);
        tempFile.setParentFolderId(parentFolderId);
        tempFile.setFileName(originalFilename);
        tempFile.setOriginalName(originalFilename);
        tempFile.setFileSize(file.getSize());
        tempFile.setMimeType(file.getContentType());
        tempFile.setFileHash(fileHash);
        
        String storageType = storageService.selectStorageNode(tempFile);
        String storagePath = STORAGE_BASE_PATH + userId + "/" + fileHash + fileExtension;
        
        tempFile.setStoragePath(storagePath);
        tempFile.setStorageType(storageType);
        tempFile.setVersion(1L);
        tempFile.setIsDeleted(false);
        tempFile.setCreatedAt(LocalDateTime.now());
        tempFile.setUpdatedAt(LocalDateTime.now());

        try {
            Path filePath = Paths.get(storagePath);
            if (!Files.exists(filePath)) {
                Files.createDirectories(filePath.getParent());
            }
            Files.copy(file.getInputStream(), filePath);

            fileMapper.insertFile(tempFile);
            
            Long nodeId = getStorageNodeId(storageType);
            if (nodeId != null) {
                storageService.updateUsedSpace(nodeId, file.getSize());
            }
            
            return convertToFileInfo(tempFile);
        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    @Override
    public FileInfo getFileById(Long fileId) {
        File file = fileMapper.getFileById(fileId);
        if (file != null) {
            return convertToFileInfo(file);
        }
        return null;
    }

    @Override
    public List<FileInfo> getFilesByFolderId(Long folderId) {
        List<File> files = fileMapper.getFilesByFolderId(folderId);
        return files.stream().map(this::convertToFileInfo).toList();
    }

    @Override
    public List<FileInfo> getFilesByUserId(Long userId) {
        List<File> files = fileMapper.getFilesByUserId(userId);
        return files.stream().map(this::convertToFileInfo).toList();
    }

    @Override
    @Transactional
    public void deleteFile(Long fileId) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }
        fileMapper.deleteFile(fileId);
    }

    @Override
    @Transactional
    public void moveFile(Long fileId, Long targetFolderId) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }
        file.setParentFolderId(targetFolderId);
        fileMapper.updateFile(file);
    }

    @Override
    @Transactional
    public void renameFile(Long fileId, String newName) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }
        file.setFileName(newName);
        fileMapper.updateFile(file);
    }

    @Override
    public FileInfo downloadFile(Long fileId) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }
        if (file.getIsDeleted()) {
            throw new RuntimeException("File has been deleted");
        }
        return convertToFileInfo(file);
    }

    private FileInfo convertToFileInfo(File file) {
        FileInfo fileInfo = new FileInfo();
        fileInfo.setId(file.getId());
        fileInfo.setUserId(file.getUserId());
        fileInfo.setParentFolderId(file.getParentFolderId());
        fileInfo.setFileName(file.getFileName());
        fileInfo.setOriginalName(file.getOriginalName());
        fileInfo.setFileSize(file.getFileSize());
        fileInfo.setMimeType(file.getMimeType());
        fileInfo.setFileHash(file.getFileHash());
        fileInfo.setStoragePath(file.getStoragePath());
        fileInfo.setStorageType(file.getStorageType());
        fileInfo.setVersion(file.getVersion());
        fileInfo.setIsDeleted(file.getIsDeleted());
        fileInfo.setCreatedAt(file.getCreatedAt());
        fileInfo.setUpdatedAt(file.getUpdatedAt());
        return fileInfo;
    }

    private Long getStorageNodeId(String storageType) {
        if ("local".equals(storageType)) {
            return null;
        }
        return 1L;
    }

    private String calculateFileHash(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hashBytes = digest.digest(file.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString();
        } catch (IOException e) {
            return UUID.randomUUID().toString();
        }
    }
}