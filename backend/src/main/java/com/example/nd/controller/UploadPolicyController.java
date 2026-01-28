package com.example.nd.controller;

import com.example.nd.dto.ApiResponse;
import com.example.nd.model.UploadPolicy;
import com.example.nd.service.UploadPolicyService;
import com.example.nd.util.AuthUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/upload-policies")
@Tag(name = "上传策略管理", description = "上传策略管理相关接口")
public class UploadPolicyController {

    @Autowired
    private UploadPolicyService uploadPolicyService;

    @PostMapping
    @Operation(summary = "创建上传策略", description = "创建新的上传策略")
    public ApiResponse<UploadPolicy> createPolicy(@RequestBody UploadPolicy policy) {
        Long userId = AuthUtil.getUserId();
        policy.setUserId(userId);
        UploadPolicy createdPolicy = uploadPolicyService.createPolicy(policy);
        return ApiResponse.success(createdPolicy);
    }

    @GetMapping("/{policyId}")
    @Operation(summary = "获取上传策略详情", description = "根据ID获取上传策略详情")
    public ApiResponse<UploadPolicy> getPolicy(@Parameter(description = "策略ID") @PathVariable Long policyId) {
        UploadPolicy policy = uploadPolicyService.getPolicyById(policyId);
        if (policy == null) {
            return ApiResponse.error("Policy not found");
        }
        return ApiResponse.success(policy);
    }

    @GetMapping
    @Operation(summary = "获取用户上传策略列表", description = "获取当前用户的所有上传策略")
    public ApiResponse<List<UploadPolicy>> getPolicies() {
        Long userId = AuthUtil.getUserId();
        List<UploadPolicy> policies = uploadPolicyService.getPoliciesByUserId(userId);
        return ApiResponse.success(policies);
    }

    @PutMapping("/{policyId}")
    @Operation(summary = "更新上传策略", description = "更新上传策略信息")
    public ApiResponse<UploadPolicy> updatePolicy(@Parameter(description = "策略ID") @PathVariable Long policyId, @RequestBody UploadPolicy policy) {
        UploadPolicy existingPolicy = uploadPolicyService.getPolicyById(policyId);
        if (existingPolicy == null) {
            return ApiResponse.error("Policy not found");
        }
        
        Long userId = AuthUtil.getUserId();
        if (!userId.equals(existingPolicy.getUserId())) {
            return ApiResponse.error("Permission denied");
        }
        
        policy.setId(policyId);
        policy.setUserId(userId);
        UploadPolicy updatedPolicy = uploadPolicyService.updatePolicy(policy);
        return ApiResponse.success(updatedPolicy);
    }

    @PutMapping("/{policyId}/status")
    @Operation(summary = "更新上传策略状态", description = "启用或禁用上传策略")
    public ApiResponse<String> updatePolicyStatus(@Parameter(description = "策略ID") @PathVariable Long policyId, @RequestParam String status) {
        UploadPolicy existingPolicy = uploadPolicyService.getPolicyById(policyId);
        if (existingPolicy == null) {
            return ApiResponse.error("Policy not found");
        }
        
        Long userId = AuthUtil.getUserId();
        if (!userId.equals(existingPolicy.getUserId())) {
            return ApiResponse.error("Permission denied");
        }
        
        uploadPolicyService.updatePolicyStatus(policyId, status);
        return ApiResponse.success("Policy status updated successfully");
    }

    @DeleteMapping("/{policyId}")
    @Operation(summary = "删除上传策略", description = "删除上传策略")
    public ApiResponse<String> deletePolicy(@Parameter(description = "策略ID") @PathVariable Long policyId) {
        UploadPolicy existingPolicy = uploadPolicyService.getPolicyById(policyId);
        if (existingPolicy == null) {
            return ApiResponse.error("Policy not found");
        }
        
        Long userId = AuthUtil.getUserId();
        if (!userId.equals(existingPolicy.getUserId())) {
            return ApiResponse.error("Permission denied");
        }
        
        uploadPolicyService.deletePolicy(policyId);
        return ApiResponse.success("Policy deleted successfully");
    }
}
