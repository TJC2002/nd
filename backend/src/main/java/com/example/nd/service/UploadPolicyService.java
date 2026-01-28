package com.example.nd.service;

import com.example.nd.model.UploadPolicy;
import com.example.nd.model.FileMetadata;

import java.util.List;

public interface UploadPolicyService {
    UploadPolicy createPolicy(UploadPolicy policy);
    UploadPolicy getPolicyById(Long id);
    List<UploadPolicy> getPoliciesByUserId(Long userId);
    List<UploadPolicy> getActivePoliciesByUserId(Long userId);
    UploadPolicy updatePolicy(UploadPolicy policy);
    void updatePolicyStatus(Long id, String status);
    void deletePolicy(Long id);
    Long selectStorageNodeByPolicy(Long userId, FileMetadata fileMetadata, String fileName);
}
