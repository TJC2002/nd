package com.example.nd.service;

import com.example.nd.dto.*;
import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.mapper.UploadTaskMapper;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;
import com.example.nd.model.UploadTask;
import com.example.nd.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UploadServiceImpl implements UploadService {

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    @Autowired
    private UploadTaskMapper uploadTaskMapper;

    @Autowired
    private StorageService storageService;
    
    @Autowired
    private CoverService coverService;

    private static final String STORAGE_BASE_PATH = "/storage/files/";
    private static final String TEMP_BASE_PATH = "/storage/temp/";

    @Override
    public CheckFileResponse checkFileExist(CheckFileRequest request) {
        FileMetadata metadata = fileMetadataMapper.getFileMetadataByHash(request.getHash());
        if (metadata != null) {
            return new CheckFileResponse(true, metadata.getId().toString());
        }
        return new CheckFileResponse(false, null);
    }

    @Override
    @Transactional
    public UploadInitResponse initializeUpload(UploadInitRequest request) {
        Long userId = AuthUtil.getUserId();
        
        String uploadId = UUID.randomUUID().toString();
        String tempPath = TEMP_BASE_PATH + uploadId + "/";
        
        UploadTask uploadTask = new UploadTask();
        uploadTask.setUploadId(uploadId);
        uploadTask.setUserId(userId);
        uploadTask.setFileName(request.getName());
        uploadTask.setFileSize(request.getSize());
        uploadTask.setFileType(request.getType());
        uploadTask.setFileHash(request.getHash());
        uploadTask.setChunkSize(request.getChunkSize());
        uploadTask.setTotalChunks(request.getTotalChunks());
        uploadTask.setUploadedChunks("");
        uploadTask.setStatus("pending");
        uploadTask.setTempPath(tempPath);
        uploadTask.setParentFolderId(request.getParentFolderId());
        uploadTask.setCreatedAt(LocalDateTime.now());
        uploadTask.setUpdatedAt(LocalDateTime.now());
        
        uploadTaskMapper.insertUploadTask(uploadTask);
        
        try {
            Files.createDirectories(Paths.get(tempPath));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create temp directory", e);
        }
        
        return new UploadInitResponse(uploadId, request.getChunkSize(), "local");
    }

    @Override
    @Transactional
    public void uploadChunk(String uploadId, Integer chunkIndex, MultipartFile chunkData) {
        UploadTask uploadTask = uploadTaskMapper.getUploadTaskByUploadId(uploadId);
        if (uploadTask == null) {
            throw new RuntimeException("Upload task not found");
        }
        
        String tempPath = uploadTask.getTempPath();
        String chunkFileName = "chunk_" + chunkIndex;
        
        try {
            Path chunkPath = Paths.get(tempPath, chunkFileName);
            Files.copy(chunkData.getInputStream(), chunkPath, StandardCopyOption.REPLACE_EXISTING);
            
            String uploadedChunks = uploadTask.getUploadedChunks();
            Set<Integer> chunkSet = new HashSet<>();
            
            if (uploadedChunks != null && !uploadedChunks.isEmpty()) {
                chunkSet = Arrays.stream(uploadedChunks.split(","))
                        .map(Integer::parseInt)
                        .collect(Collectors.toSet());
            }
            
            chunkSet.add(chunkIndex);
            uploadTask.setUploadedChunks(chunkSet.stream()
                    .sorted()
                    .map(String::valueOf)
                    .collect(Collectors.joining(",")));
            
            uploadTaskMapper.updateUploadedChunks(uploadId, uploadTask.getUploadedChunks());
        } catch (IOException e) {
            throw new RuntimeException("Failed to save chunk", e);
        }
    }

    @Override
    @Transactional
    public File completeUpload(UploadCompleteRequest request) {
        UploadTask uploadTask = uploadTaskMapper.getUploadTaskByUploadId(request.getUploadId());
        if (uploadTask == null) {
            throw new RuntimeException("Upload task not found");
        }
        
        // 检查文件是否已存在（秒传逻辑）
        FileMetadata existingMetadata = fileMetadataMapper.getFileMetadataByHash(request.getHash());
        if (existingMetadata != null) {
            // 文件已存在，直接创建用户关联记录
            File file = new File();
            file.setUserId(uploadTask.getUserId());
            file.setParentId(uploadTask.getParentFolderId() != null ? uploadTask.getParentFolderId() : 0L);
            file.setMetadataId(existingMetadata.getId());
            file.setName(uploadTask.getFileName());
            file.setIsFolder(false);
            
            fileMapper.insertFile(file);
            
            // 更新文件元数据的引用计数
            fileMetadataMapper.updateReferenceCount(existingMetadata.getId(), 1);
            
            uploadTask.setStatus("completed");
            uploadTaskMapper.updateUploadTask(uploadTask);
            
            cleanUpTempFiles(uploadTask.getTempPath());
            
            return file;
        }
        
        String tempPath = uploadTask.getTempPath();
        String fileExtension = getFileExtension(uploadTask.getFileName());
        String hash = request.getHash();
        String hashPrefix1 = hash.substring(0, 2);
        String hashPrefix2 = hash.substring(2, 4);
        String finalPath = STORAGE_BASE_PATH + hashPrefix1 + "/" + hashPrefix2 + "/" + hash + fileExtension;
        
        try {
            Path finalFilePath = Paths.get(finalPath);
            Files.createDirectories(finalFilePath.getParent());
            
            List<Path> chunkFiles = Files.list(Paths.get(tempPath))
                    .filter(path -> path.getFileName().toString().startsWith("chunk_"))
                    .sorted(Comparator.comparing(path -> {
                        String fileName = path.getFileName().toString();
                        int index = Integer.parseInt(fileName.substring("chunk_".length()));
                        return index;
                    }))
                    .toList();
            
            try (FileOutputStream outputStream = new FileOutputStream(finalFilePath.toFile())) {
                for (Path chunkFile : chunkFiles) {
                    Files.copy(chunkFile, outputStream);
                }
            }
            
            // 基于文件内容检测MIME类型
            String detectedMimeType = detectMimeType(finalFilePath);
            String mimeType = detectedMimeType != null ? detectedMimeType : uploadTask.getFileType();
            
            // 创建文件元数据
            FileMetadata fileMetadata = new FileMetadata();
            fileMetadata.setHashValue(uploadTask.getFileHash());
            fileMetadata.setSize(uploadTask.getFileSize());
            fileMetadata.setMimeType(mimeType);
            fileMetadata.setStoragePath(finalPath);
            fileMetadata.setReferenceCount(1);
            
            String storageType = storageService.selectStorageNode(fileMetadata);
            fileMetadata.setStorageNodeId(getStorageNodeId(storageType));
            
            fileMetadataMapper.insertFileMetadata(fileMetadata);
            
            // 创建用户文件关联
            File file = new File();
            file.setUserId(uploadTask.getUserId());
            file.setParentId(uploadTask.getParentFolderId() != null ? uploadTask.getParentFolderId() : 0L);
            file.setMetadataId(fileMetadata.getId());
            file.setName(uploadTask.getFileName());
            file.setIsFolder(false);
            
            fileMapper.insertFile(file);
            
            // 生成文件封面
            try {
                Path filePath = Paths.get(finalPath);
                String coverPath = coverService.generateCover(file.getId(), filePath, mimeType);
                fileMetadata.setCoverPath(coverPath);
                fileMetadataMapper.updateFileMetadata(fileMetadata);
            } catch (Exception e) {
                System.err.println("Failed to generate cover: " + e.getMessage());
            }
            
            Long nodeId = getStorageNodeId(storageType);
            if (nodeId != null) {
                storageService.updateUsedSpace(nodeId, uploadTask.getFileSize());
            }
            
            uploadTask.setStatus("completed");
            uploadTaskMapper.updateUploadTask(uploadTask);
            
            cleanUpTempFiles(tempPath);
            
            return file;
        } catch (IOException e) {
            throw new RuntimeException("Failed to complete upload", e);
        }
    }

    private String detectMimeType(Path filePath) {
        try {
            return Files.probeContentType(filePath);
        } catch (IOException e) {
            System.err.println("Failed to detect MIME type: " + e.getMessage());
            return null;
        }
    }

    @Override
    public UploadTask getUploadStatus(String uploadId) {
        return uploadTaskMapper.getUploadTaskByUploadId(uploadId);
    }

    @Override
    @Transactional
    public void cancelUpload(String uploadId) {
        UploadTask uploadTask = uploadTaskMapper.getUploadTaskByUploadId(uploadId);
        if (uploadTask != null) {
            String tempPath = uploadTask.getTempPath();
            uploadTaskMapper.deleteUploadTaskByUploadId(uploadId);
            cleanUpTempFiles(tempPath);
        }
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : "";
    }

    private Long getStorageNodeId(String storageType) {
        if ("local".equals(storageType)) {
            return null;
        }
        return 1L;
    }

    private void cleanUpTempFiles(String tempPath) {
        try {
            Path tempDir = Paths.get(tempPath);
            if (Files.exists(tempDir)) {
                Files.walk(tempDir)
                        .sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                System.err.println("Failed to delete temp file: " + path);
                            }
                        });
            }
        } catch (IOException e) {
            System.err.println("Failed to clean up temp files: " + tempPath);
        }
    }
}
