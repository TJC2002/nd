package com.example.nd.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.example.nd.dto.ApiResponse;
import com.example.nd.dto.CreateDownloadTaskRequest;
import com.example.nd.dto.DownloadTaskActionRequest;
import com.example.nd.dto.DownloadTaskResponse;
import com.example.nd.service.DownloadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/downloads")
@Tag(name = "离线下载管理", description = "离线下载任务管理相关接口")
public class DownloadController {

    @Autowired
    private DownloadService downloadService;

    @PostMapping
    @SaCheckLogin
    @Operation(summary = "创建下载任务", description = "创建新的离线下载任务")
    public ApiResponse<DownloadTaskResponse> createDownloadTask(@RequestBody CreateDownloadTaskRequest request) {
        DownloadTaskResponse response = downloadService.createDownloadTask(request);
        return ApiResponse.success(response);
    }

    @GetMapping("/{taskId}")
    @SaCheckLogin
    @Operation(summary = "获取下载任务详情", description = "获取指定下载任务的详细信息")
    public ApiResponse<DownloadTaskResponse> getDownloadTask(
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        DownloadTaskResponse response = downloadService.getDownloadTask(taskId);
        return ApiResponse.success(response);
    }

    @GetMapping
    @SaCheckLogin
    @Operation(summary = "获取用户下载任务列表", description = "获取当前用户的所有下载任务")
    public ApiResponse<List<DownloadTaskResponse>> getUserDownloadTasks() {
        List<DownloadTaskResponse> tasks = downloadService.getUserDownloadTasks();
        return ApiResponse.success(tasks);
    }

    @PostMapping("/{taskId}/control")
    @SaCheckLogin
    @Operation(summary = "控制下载任务", description = "控制下载任务（暂停/恢复/取消）")
    public ApiResponse<String> controlDownloadTask(
            @Parameter(description = "任务ID") @PathVariable Long taskId,
            @RequestBody DownloadTaskActionRequest request) {
        downloadService.controlDownloadTask(taskId, request);
        return ApiResponse.success("Task controlled successfully");
    }

    @DeleteMapping("/{taskId}")
    @SaCheckLogin
    @Operation(summary = "删除下载任务", description = "删除指定的下载任务")
    public ApiResponse<String> deleteDownloadTask(
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        downloadService.deleteDownloadTask(taskId);
        return ApiResponse.success("Task deleted successfully");
    }
}
