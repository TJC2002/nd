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
        
        File tempFile = new File();
        tempFile.setUserId(userId);
        tempFile.setParentId(parentFolderId != null ? parentFolderId : 0L);
        tempFile.setName(originalFilename);
        tempFile.setIsFolder(false);
        tempFile.setCreatedAt(LocalDateTime.now());
        tempFile.setUpdatedAt(LocalDateTime.now());

        fileMapper.insertFile(tempFile);
        
        return convertToFileInfo(tempFile);
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
    public List<FileInfo> getFolderPath(Long folderId, Long userId) {
        List<FileInfo> path = new java.util.ArrayList<>();
        if (folderId == null || folderId == 0) {
            return path;
        }

        File currentFolder = fileMapper.getFileById(folderId);
        if (currentFolder == null || !currentFolder.getIsFolder()) {
            return path;
        }

        Long currentId = folderId;
        while (currentId != null && currentId > 0) {
            File folder = fileMapper.getFileById(currentId);
            if (folder != null) {
                path.add(0, convertToFileInfo(folder));
                currentId = folder.getParentId();
            } else {
                break;
            }
        }

        java.util.Collections.reverse(path);
        return path;
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
        file.setParentId(targetFolderId);
        fileMapper.updateFile(file);
    }

    @Override
    @Transactional
    public void renameFile(Long fileId, String newName) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }
        file.setName(newName);
        fileMapper.updateFile(file);
    }

    @Override
    public FileInfo downloadFile(Long fileId) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }
        if (file.getDeletedAt() != null) {
            throw new RuntimeException("File has been deleted");
        }
        return convertToFileInfo(file);
    }

    @Override
    @Transactional
    public FileInfo createFolder(Long userId, String folderName, Long parentFolderId) {
        User user = userMapper.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        File folder = new File();
        folder.setUserId(userId);
        folder.setParentId(parentFolderId != null ? parentFolderId : 0L);
        folder.setName(folderName);
        folder.setIsFolder(true);
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());

        fileMapper.insertFile(folder);
        return convertToFileInfo(folder);
    }

    private FileInfo convertToFileInfo(File file) {
        FileInfo fileInfo = new FileInfo();
        fileInfo.setId(file.getId());
        fileInfo.setUserId(file.getUserId());
        fileInfo.setParentFolderId(file.getParentId());
        fileInfo.setFileName(file.getName());
        fileInfo.setOriginalName(file.getName());
        fileInfo.setCreatedAt(file.getCreatedAt());
        fileInfo.setUpdatedAt(file.getUpdatedAt());
        fileInfo.setDeletedAt(file.getDeletedAt());
        fileInfo.setIsFolder(file.getIsFolder());
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