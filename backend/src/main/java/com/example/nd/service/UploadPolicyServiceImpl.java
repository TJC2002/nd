package com.example.nd.service;

import com.example.nd.mapper.UploadPolicyMapper;
import com.example.nd.mapper.StorageMapper;
import com.example.nd.model.UploadPolicy;
import com.example.nd.model.FileMetadata;
import com.example.nd.model.StorageNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UploadPolicyServiceImpl implements UploadPolicyService {

    @Autowired
    private UploadPolicyMapper uploadPolicyMapper;

    @Autowired
    private StorageMapper storageMapper;

    @Override
    @Transactional
    public UploadPolicy createPolicy(UploadPolicy policy) {
        policy.setStatus("active");
        policy.setCreatedAt(LocalDateTime.now());
        policy.setUpdatedAt(LocalDateTime.now());
        uploadPolicyMapper.insertPolicy(policy);
        return policy;
    }

    @Override
    public UploadPolicy getPolicyById(Long id) {
        return uploadPolicyMapper.getPolicyById(id);
    }

    @Override
    public List<UploadPolicy> getPoliciesByUserId(Long userId) {
        return uploadPolicyMapper.getPoliciesByUserId(userId);
    }

    @Override
    public List<UploadPolicy> getActivePoliciesByUserId(Long userId) {
        return uploadPolicyMapper.getActivePoliciesByUserId(userId);
    }

    @Override
    @Transactional
    public UploadPolicy updatePolicy(UploadPolicy policy) {
        policy.setUpdatedAt(LocalDateTime.now());
        uploadPolicyMapper.updatePolicy(policy);
        return policy;
    }

    @Override
    @Transactional
    public void updatePolicyStatus(Long id, String status) {
        uploadPolicyMapper.updatePolicyStatus(id, status);
    }

    @Override
    @Transactional
    public void deletePolicy(Long id) {
        uploadPolicyMapper.deletePolicy(id);
    }

    @Override
    public Long selectStorageNodeByPolicy(Long userId, FileMetadata fileMetadata, String fileName) {
        List<UploadPolicy> policies = uploadPolicyMapper.getActivePoliciesByUserId(userId);
        
        for (UploadPolicy policy : policies) {
            if (matchesPolicy(policy, fileMetadata, fileName)) {
                StorageNode node = storageMapper.getNodeById(policy.getStorageNodeId());
                if (node != null && "active".equals(node.getStatus())) {
                    return policy.getStorageNodeId();
                }
            }
        }
        
        return selectDefaultStorageNode();
    }

    private boolean matchesPolicy(UploadPolicy policy, FileMetadata fileMetadata, String fileName) {
        Long fileSize = fileMetadata.getSize();
        String mimeType = fileMetadata.getMimeType();
        
        if (policy.getMinSize() != null && fileSize < policy.getMinSize()) {
            return false;
        }
        
        if (policy.getMaxSize() != null && fileSize > policy.getMaxSize()) {
            return false;
        }
        
        if ("file_type".equals(policy.getRuleType())) {
            if (policy.getRuleValue() != null) {
                return mimeType != null && mimeType.startsWith(policy.getRuleValue());
            }
        } else if ("file_extension".equals(policy.getRuleType())) {
            if (policy.getRuleValue() != null && fileName != null) {
                return fileName.toLowerCase().endsWith(policy.getRuleValue().toLowerCase());
            }
        } else if ("file_name".equals(policy.getRuleType())) {
            if (policy.getRuleValue() != null && fileName != null) {
                return fileName.toLowerCase().contains(policy.getRuleValue().toLowerCase());
            }
        }
        
        return true;
    }

    private Long selectDefaultStorageNode() {
        List<StorageNode> nodes = storageMapper.getAllNodes();
        if (nodes == null || nodes.isEmpty()) {
            return null;
        }
        
        StorageNode selectedNode = null;
        Long maxAvailableSpace = 0L;
        
        for (StorageNode node : nodes) {
            if ("active".equals(node.getStatus())) {
                Long availableSpace = node.getCapacity() - node.getUsedSpace();
                if (availableSpace > maxAvailableSpace) {
                    maxAvailableSpace = availableSpace;
                    selectedNode = node;
                }
            }
        }
        
        return selectedNode != null ? selectedNode.getId() : null;
    }
}
