package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.mapper.StorageMapper;
import com.example.nd.model.StorageNode;
import com.example.nd.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        node.setCapacity(request.getCapacity());
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
}