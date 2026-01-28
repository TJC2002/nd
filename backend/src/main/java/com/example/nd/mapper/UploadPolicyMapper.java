package com.example.nd.mapper;

import com.example.nd.model.UploadPolicy;

import java.util.List;

public interface UploadPolicyMapper {
    UploadPolicy getPolicyById(Long id);
    List<UploadPolicy> getPoliciesByUserId(Long userId);
    List<UploadPolicy> getActivePoliciesByUserId(Long userId);
    void insertPolicy(UploadPolicy policy);
    void updatePolicy(UploadPolicy policy);
    void updatePolicyStatus(Long id, String status);
    void deletePolicy(Long id);
}
