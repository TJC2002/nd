package com.example.nd.service;

import com.example.nd.mapper.StorageMapper;
import com.example.nd.model.StorageNode;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StorageServiceImpl implements StorageService {

    @Autowired
    private StorageMapper storageMapper;

    private static final Long SMALL_FILE_THRESHOLD = 100 * 1024 * 1024L;
    private static final Long DEFAULT_NODE_CAPACITY = 100 * 1024 * 1024 * 1024L;

    @Override
    @Transactional
    public StorageNode createNode(String nodeName, String storageType, String storagePath, String connectionConfig, Long capacity) {
        StorageNode node = new StorageNode();
        node.setNodeName(nodeName);
        node.setStorageType(storageType);
        node.setStoragePath(storagePath);
        node.setConnectionConfig(connectionConfig);
        node.setCapacity(capacity != null ? DEFAULT_NODE_CAPACITY : capacity);
        node.setUsedSpace(0L);
        node.setStatus("active");
        node.setCreatedAt(java.time.LocalDateTime.now());
        node.setUpdatedAt(java.time.LocalDateTime.now());
        storageMapper.insertNode(node);
        return node;
    }

    @Override
    public StorageNode getNodeById(Long nodeId) {
        return storageMapper.getNodeById(nodeId);
    }

    @Override
    public List<StorageNode> getAllNodes() {
        return storageMapper.getAllNodes();
    }

    @Override
    @Transactional
    public void updateNodeStatus(Long nodeId, String status) {
        storageMapper.updateNodeStatus(nodeId, status);
    }

    @Override
    @Transactional
    public void deleteNode(Long nodeId) {
        storageMapper.deleteNode(nodeId);
    }

    @Override
    public String selectStorageNode(File file) {
        List<StorageNode> nodes = getAllNodes();
        if (nodes == null || nodes.isEmpty()) {
            return "local";
        }

        StorageNode selectedNode = null;
        Long maxAvailableSpace = 0L;

        for (StorageNode node : nodes) {
            if (!"active".equals(node.getStatus())) {
                continue;
            }

            Long availableSpace = node.getCapacity() - node.getUsedSpace();
            if (availableSpace > maxAvailableSpace) {
                maxAvailableSpace = availableSpace;
                selectedNode = node;
            }
        }

        if (selectedNode != null) {
            return selectedNode.getStorageType();
        }

        return "local";
    }

    @Override
    public String selectStorageNode(FileMetadata fileMetadata) {
        List<StorageNode> nodes = getAllNodes();
        if (nodes == null || nodes.isEmpty()) {
            return "local";
        }

        StorageNode selectedNode = null;
        Long maxAvailableSpace = 0L;

        for (StorageNode node : nodes) {
            if (!"active".equals(node.getStatus())) {
                continue;
            }

            Long availableSpace = node.getCapacity() - node.getUsedSpace();
            if (availableSpace > maxAvailableSpace) {
                maxAvailableSpace = availableSpace;
                selectedNode = node;
            }
        }

        if (selectedNode != null) {
            return selectedNode.getStorageType();
        }

        return "local";
    }

    @Override
    @Transactional
    public void updateUsedSpace(Long nodeId, Long fileSize) {
        StorageNode node = storageMapper.getNodeById(nodeId);
        if (node != null) {
            node.setUsedSpace(node.getUsedSpace() + fileSize);
            storageMapper.updateNode(node);
        }
    }
}