package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.mapper.StorageMapper;
import com.example.nd.model.StorageNode;
import com.example.nd.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/storage")
@Tag(name = "存储管理", description = "存储节点管理相关接口")
public class StorageController {

    @Autowired
    private StorageService storageService;

    @Autowired
    private StorageMapper storageMapper;

    @GetMapping("/nodes")
    @Operation(summary = "获取存储节点列表", description = "获取所有存储节点")
    public ApiResponse<List<StorageNode>> getAllNodes() {
        List<StorageNode> nodes = storageService.getAllNodes();
        return ApiResponse.success(nodes);
    }

    @GetMapping("/nodes/{nodeId}")
    @Operation(summary = "获取存储节点详情", description = "根据ID获取存储节点详情")
    public ApiResponse<StorageNode> getNodeById(@PathVariable Long nodeId) {
        StorageNode node = storageService.getNodeById(nodeId);
        if (node == null) {
            return ApiResponse.error("Storage node not found");
        }
        return ApiResponse.success(node);
    }

    @PostMapping("/nodes")
    @Operation(summary = "创建存储节点", description = "创建新的存储节点")
    public ApiResponse<StorageNode> createNode(@RequestBody CreateStorageNodeRequest request) {
        StorageNode node = storageService.createNode(
                request.getNodeName(),
                request.getStorageType(),
                request.getStoragePath(),
                request.getConnectionConfig(),
                request.getCapacity()
        );
        return ApiResponse.success(node);
    }

    @PutMapping("/nodes/{nodeId}")
    @Operation(summary = "更新存储节点", description = "更新存储节点信息")
    public ApiResponse<String> updateNode(@PathVariable Long nodeId, @RequestBody UpdateStorageNodeRequest request) {
        StorageNode node = storageService.getNodeById(nodeId);
        if (node == null) {
            return ApiResponse.error("Storage node not found");
        }

        node.setNodeName(request.getNodeName());
        node.setStorageType(request.getStorageType());
        node.setStoragePath(request.getStoragePath());
        node.setConnectionConfig(request.getConnectionConfig());
        node.setCapacity(request.getCapacity());
        if (request.getStatus() != null) {
            node.setStatus(request.getStatus());
        }
        storageMapper.updateNode(node);
        return ApiResponse.success("Storage node updated successfully");
    }

    @PutMapping("/nodes/{nodeId}/status")
    @Operation(summary = "更新存储节点状态", description = "启用或禁用存储节点")
    public ApiResponse<String> updateNodeStatus(@PathVariable Long nodeId, @RequestBody UpdateNodeStatusRequest request) {
        storageService.updateNodeStatus(nodeId, request.getStatus());
        return ApiResponse.success("Storage node status updated successfully");
    }

    @DeleteMapping("/nodes/{nodeId}")
    @Operation(summary = "删除存储节点", description = "删除存储节点")
    public ApiResponse<String> deleteNode(@PathVariable Long nodeId) {
        storageService.deleteNode(nodeId);
        return ApiResponse.success("Storage node deleted successfully");
    }

    @GetMapping("/status")
    @Operation(summary = "获取存储状态", description = "获取当前存储状态")
    public ApiResponse<StorageStatusResponse> getStorageStatus() {
        List<StorageNode> nodes = storageService.getAllNodes();
        long totalCapacity = nodes.stream().mapToLong(StorageNode::getCapacity).sum();
        long totalUsedSpace = nodes.stream().mapToLong(StorageNode::getUsedSpace).sum();
        long availableSpace = totalCapacity - totalUsedSpace;

        StorageStatusResponse response = new StorageStatusResponse();
        response.setTotalCapacity(totalCapacity);
        response.setTotalUsedSpace(totalUsedSpace);
        response.setAvailableSpace(availableSpace);
        response.setNodeCount((long) nodes.size());
        return ApiResponse.success(response);
    }

    @GetMapping("/nodes/active")
    @Operation(summary = "获取活跃存储节点列表", description = "获取所有状态为active的存储节点")
    public ApiResponse<List<StorageNode>> getActiveNodes() {
        List<StorageNode> allNodes = storageService.getAllNodes();
        List<StorageNode> activeNodes = allNodes.stream()
                .filter(node -> "active".equals(node.getStatus()))
                .collect(Collectors.toList());
        return ApiResponse.success(activeNodes);
    }

    @GetMapping("/nodes/{nodeId}/usage")
    @Operation(summary = "获取存储节点使用情况", description = "获取指定存储节点的详细使用情况")
    public ApiResponse<Map<String, Object>> getNodeUsage(@PathVariable Long nodeId) {
        StorageNode node = storageService.getNodeById(nodeId);
        if (node == null) {
            return ApiResponse.error("Storage node not found");
        }
        
        Map<String, Object> usageInfo = new HashMap<>();
        usageInfo.put("nodeId", node.getId());
        usageInfo.put("nodeName", node.getNodeName());
        usageInfo.put("storageType", node.getStorageType());
        usageInfo.put("totalCapacity", node.getCapacity());
        usageInfo.put("usedSpace", node.getUsedSpace());
        usageInfo.put("availableSpace", node.getCapacity() - node.getUsedSpace());
        usageInfo.put("usagePercentage", node.getCapacity() > 0 ? 
                (double) node.getUsedSpace() / node.getCapacity() * 100 : 0);
        usageInfo.put("status", node.getStatus());
        
        return ApiResponse.success(usageInfo);
    }

    @PostMapping("/nodes/{nodeId}/test")
    @Operation(summary = "测试存储节点连接", description = "测试存储节点的连接状态")
    public ApiResponse<Map<String, Object>> testNodeConnection(@PathVariable Long nodeId) {
        StorageNode node = storageService.getNodeById(nodeId);
        if (node == null) {
            return ApiResponse.error("Storage node not found");
        }
        
        Map<String, Object> testResult = new HashMap<>();
        testResult.put("nodeId", node.getId());
        testResult.put("nodeName", node.getNodeName());
        
        try {
            if ("local".equals(node.getStorageType())) {
                Path storagePath = Paths.get(node.getStoragePath());
                boolean exists = Files.exists(storagePath);
                boolean writable = false;
                
                if (exists) {
                    writable = Files.isWritable(storagePath);
                } else {
                    try {
                        Files.createDirectories(storagePath);
                        writable = true;
                    } catch (IOException e) {
                        writable = false;
                    }
                }
                
                testResult.put("exists", exists);
                testResult.put("writable", writable);
                testResult.put("reachable", exists && writable);
            } else {
                testResult.put("reachable", true);
                testResult.put("message", "Connection test not implemented for this storage type");
            }
            
            testResult.put("status", "success");
        } catch (Exception e) {
            testResult.put("status", "error");
            testResult.put("message", e.getMessage());
            testResult.put("reachable", false);
        }
        
        return ApiResponse.success(testResult);
    }

    @PutMapping("/nodes/batch/status")
    @Operation(summary = "批量更新存储节点状态", description = "批量启用/禁用多个存储节点")
    public ApiResponse<Map<String, Object>> batchUpdateNodeStatus(@RequestBody BatchUpdateNodeStatusRequest request) {
        List<Long> nodeIds = request.getNodeIds();
        String status = request.getStatus();
        
        if (nodeIds == null || nodeIds.isEmpty()) {
            return ApiResponse.error("Node IDs cannot be empty");
        }
        
        int successCount = 0;
        List<Long> failedIds = new ArrayList<>();
        
        for (Long nodeId : nodeIds) {
            try {
                storageService.updateNodeStatus(nodeId, status);
                successCount++;
            } catch (Exception e) {
                failedIds.add(nodeId);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalNodes", nodeIds.size());
        result.put("successCount", successCount);
        result.put("failedCount", failedIds.size());
        result.put("failedIds", failedIds);
        result.put("status", status);
        
        return ApiResponse.success(result);
    }

    @GetMapping("/node-types")
    @Operation(summary = "获取支持的存储节点类型", description = "获取系统支持的存储节点类型列表")
    public ApiResponse<List<Map<String, Object>>> getNodeTypes() {
        List<Map<String, Object>> nodeTypes = new ArrayList<>();

        Map<String, Object> localType = new HashMap<>();
        localType.put("type", "local");
        localType.put("name", "本地存储");
        localType.put("description", "存储在本地文件系统");

        List<Map<String, Object>> localFields = new ArrayList<>();
        localFields.add(createFieldDefinition("path", "存储路径", "string", 1, true, "/data/storage",
            "本地文件系统存储路径，必须确保目录存在且有写权限", 1));
        localType.put("configFields", localFields);
        nodeTypes.add(localType);

        Map<String, Object> ossType = new HashMap<>();
        ossType.put("type", "oss");
        ossType.put("name", "阿里云OSS");
        ossType.put("description", "存储在阿里云对象存储服务");

        List<Map<String, Object>> ossFields = new ArrayList<>();
        ossFields.add(createFieldDefinition("accessKeyId", "AccessKey ID", "string", 2, true, "",
            "阿里云Access Key ID，在阿里云控制台获取", 1));
        ossFields.add(createFieldDefinition("accessKeySecret", "AccessKey Secret", "password", 3, true, "",
            "阿里云Access Key Secret，在阿里云控制台获取", 2));
        ossFields.add(createFieldDefinition("endpoint", "OSS访问域名", "string", 4, true, "oss-cn-hangzhou.aliyuncs.com",
            "OSS服务的访问域名，例如：oss-cn-hangzhou.aliyuncs.com", 3));
        ossFields.add(createFieldDefinition("bucketName", "存储桶名称", "string", 5, true, "",
            "阿里云OSS的Bucket名称", 4));
        ossFields.add(createFieldDefinition("region", "区域", "string", 6, true, "cn-hangzhou",
            "OSS所在区域，例如：cn-hangzhou、cn-beijing", 5));
        ossType.put("configFields", ossFields);
        nodeTypes.add(ossType);

        Map<String, Object> minioType = new HashMap<>();
        minioType.put("type", "minio");
        minioType.put("name", "MinIO");
        minioType.put("description", "存储在MinIO对象存储服务");

        List<Map<String, Object>> minioFields = new ArrayList<>();
        minioFields.add(createFieldDefinition("endpoint", "MinIO服务地址", "string", 4, true, "http://localhost:9000",
            "MinIO服务器的访问地址，例如：http://localhost:9000", 1));
        minioFields.add(createFieldDefinition("accessKey", "访问密钥", "string", 3, true, "",
            "MinIO的Access Key", 2));
        minioFields.add(createFieldDefinition("secretKey", "秘密密钥", "password", 3, true, "",
            "MinIO的Secret Key", 3));
        minioFields.add(createFieldDefinition("bucketName", "存储桶名称", "string", 5, true, "",
            "MinIO的Bucket名称", 4));
        minioFields.add(createFieldDefinition("region", "区域", "string", 2, true, "us-east-1",
            "MinIO区域，通常为us-east-1", 5));
        minioType.put("configFields", minioFields);
        nodeTypes.add(minioType);

        Map<String, Object> ftpType = new HashMap<>();
        ftpType.put("type", "ftp");
        ftpType.put("name", "FTP存储");
        ftpType.put("description", "存储在FTP服务器");

        List<Map<String, Object>> ftpFields = new ArrayList<>();
        ftpFields.add(createFieldDefinition("host", "FTP服务器地址", "string", 4, true, "",
            "FTP服务器的地址，例如：ftp.example.com", 1));
        ftpFields.add(createFieldDefinition("port", "端口", "number", 3, true, "21",
            "FTP服务器端口，默认为21", 2));
        ftpFields.add(createFieldDefinition("username", "用户名", "string", 3, true, "",
            "FTP登录用户名", 3));
        ftpFields.add(createFieldDefinition("password", "密码", "password", 3, true, "",
            "FTP登录密码", 4));
        ftpFields.add(createFieldDefinition("passiveMode", "被动模式", "boolean", 1, true, "true",
            "是否使用被动模式（PASV），建议开启", 5));
        ftpType.put("configFields", ftpFields);
        nodeTypes.add(ftpType);

        return ApiResponse.success(nodeTypes);
    }

    private Map<String, Object> createFieldDefinition(String key, String label, String type, int minLength, boolean required, String defaultValue, String helperText, int order) {
        Map<String, Object> field = new HashMap<>();
        field.put("key", key);
        field.put("label", label);
        field.put("type", type);
        field.put("minLength", minLength);
        field.put("required", required);
        field.put("defaultValue", defaultValue);
        field.put("helperText", helperText);
        field.put("order", order);
        return field;
    }
}