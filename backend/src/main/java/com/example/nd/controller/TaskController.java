package com.example.nd.controller;

import com.example.nd.dto.ApiResponse;
import com.example.nd.dto.TaskResponse;
import com.example.nd.dto.TaskSubmitRequest;
import com.example.nd.model.AsyncTask;
import com.example.nd.service.TaskManagerService;
import com.example.nd.util.AuthUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@Tag(name = "异步任务管理", description = "异步任务相关接口")
public class TaskController {

    @Autowired
    private TaskManagerService taskManagerService;

    @PostMapping("/submit")
    @Operation(summary = "提交任务", description = "提交异步处理任务")
    public ApiResponse<TaskResponse> submitTask(@RequestBody TaskSubmitRequest request) {
        try {
            Long userId = AuthUtil.getUserId();
            Long taskId = taskManagerService.submitTask(userId, request.getFileId(), 
                request.getTaskType(), request.getTaskParams());
            
            AsyncTask task = taskManagerService.getTaskStatus(taskId);
            return ApiResponse.success(convertToTaskResponse(task));
        } catch (Exception e) {
            return ApiResponse.error("提交任务失败: " + e.getMessage());
        }
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "获取任务状态", description = "根据任务ID获取任务详细信息")
    public ApiResponse<TaskResponse> getTaskStatus(@PathVariable Long taskId) {
        try {
            AsyncTask task = taskManagerService.getTaskStatus(taskId);
            if (task == null) {
                return ApiResponse.error("任务不存在");
            }
            return ApiResponse.success(convertToTaskResponse(task));
        } catch (Exception e) {
            return ApiResponse.error("获取任务状态失败: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    @Operation(summary = "获取用户任务列表", description = "获取当前用户的所有任务")
    public ApiResponse<List<TaskResponse>> getUserTasks() {
        try {
            Long userId = AuthUtil.getUserId();
            List<AsyncTask> tasks = taskManagerService.getUserTasks(userId);
            List<TaskResponse> responses = tasks.stream()
                    .map(this::convertToTaskResponse)
                    .toList();
            return ApiResponse.success(responses);
        } catch (Exception e) {
            return ApiResponse.error("获取用户任务失败: " + e.getMessage());
        }
    }

    @GetMapping("/file/{fileId}")
    @Operation(summary = "获取文件任务列表", description = "获取指定文件的所有任务")
    public ApiResponse<List<TaskResponse>> getFileTasks(@PathVariable Long fileId) {
        try {
            List<AsyncTask> tasks = taskManagerService.getFileTasks(fileId);
            List<TaskResponse> responses = tasks.stream()
                    .map(this::convertToTaskResponse)
                    .toList();
            return ApiResponse.success(responses);
        } catch (Exception e) {
            return ApiResponse.error("获取文件任务失败: " + e.getMessage());
        }
    }

    @PostMapping("/{taskId}/cancel")
    @Operation(summary = "取消任务", description = "取消指定的任务")
    public ApiResponse<String> cancelTask(@PathVariable Long taskId) {
        try {
            taskManagerService.cancelTask(taskId);
            return ApiResponse.success("任务已取消");
        } catch (Exception e) {
            return ApiResponse.error("取消任务失败: " + e.getMessage());
        }
    }

    @PostMapping("/{taskId}/pause")
    @Operation(summary = "暂停任务", description = "暂停指定的任务")
    public ApiResponse<String> pauseTask(@PathVariable Long taskId) {
        try {
            taskManagerService.pauseTask(taskId);
            return ApiResponse.success("任务已暂停");
        } catch (Exception e) {
            return ApiResponse.error("暂停任务失败: " + e.getMessage());
        }
    }

    @PostMapping("/{taskId}/resume")
    @Operation(summary = "恢复任务", description = "恢复暂停的任务")
    public ApiResponse<String> resumeTask(@PathVariable Long taskId) {
        try {
            taskManagerService.resumeTask(taskId);
            return ApiResponse.success("任务已恢复");
        } catch (Exception e) {
            return ApiResponse.error("恢复任务失败: " + e.getMessage());
        }
    }

    private TaskResponse convertToTaskResponse(AsyncTask task) {
        TaskResponse response = new TaskResponse();
        response.setTaskId(task.getId());
        response.setTaskType(task.getTaskType());
        response.setStatus(task.getStatus());
        response.setProgress(task.getProgress());
        response.setMessage(task.getMessage());
        response.setResultData(task.getResultData());
        response.setErrorDetails(task.getErrorDetails());
        
        if (task.getCreatedAt() != null) {
            response.setCreatedAt(task.getCreatedAt().toString());
        }
        if (task.getUpdatedAt() != null) {
            response.setUpdatedAt(task.getUpdatedAt().toString());
        }
        if (task.getStartedAt() != null) {
            response.setStartedAt(task.getStartedAt().toString());
        }
        if (task.getCompletedAt() != null) {
            response.setCompletedAt(task.getCompletedAt().toString());
        }
        
        return response;
    }
}
