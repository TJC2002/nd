package com.example.nd.service;

import com.example.nd.model.StorageNode;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;

import java.util.List;

public interface StorageService {
    
    StorageNode createNode(String nodeName, String storageType, String storagePath, Long capacity);
    
    StorageNode getNodeById(Long nodeId);
    
    List<StorageNode> getAllNodes();
    
    void updateNodeStatus(Long nodeId, String status);
    
    void deleteNode(Long nodeId);
    
    String selectStorageNode(File file);
    
    String selectStorageNode(FileMetadata fileMetadata);
    
    void updateUsedSpace(Long nodeId, Long fileSize);
}