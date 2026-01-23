package com.example.nd.service.impl;

import com.example.nd.dto.ApiResponse;
import com.example.nd.dto.CreateDownloadTaskRequest;
import com.example.nd.dto.DownloadTaskActionRequest;
import com.example.nd.dto.DownloadTaskResponse;
import com.example.nd.mapper.DownloadTaskMapper;
import com.example.nd.model.DownloadTask;
import com.example.nd.service.DownloadService;
import com.example.nd.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DownloadServiceImpl implements DownloadService {

    @Autowired
    private DownloadTaskMapper downloadTaskMapper;

    @Override
    @Transactional
    public DownloadTaskResponse createDownloadTask(CreateDownloadTaskRequest request) {
        Long userId = AuthUtil.getUserId();
        
        DownloadTask task = new DownloadTask();
        task.setUserId(userId);
        task.setTaskName(request.getTaskName());
        task.setDownloadUrl(request.getDownloadUrl());
        task.setDownloadType(request.getDownloadType());
        task.setFileName(request.getFileName());
        task.setFileSize(request.getFileSize());
        task.setSavePath(request.getSavePath());
        task.setStatus("pending");
        task.setProgress(0);
        
        downloadTaskMapper.insertDownloadTask(task);
        
        return mapToResponse(task);
    }

    @Override
    public DownloadTaskResponse getDownloadTask(Long taskId) {
        DownloadTask task = downloadTaskMapper.getDownloadTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("下载任务不存在");
        }
        return mapToResponse(task);
    }

    @Override
    public List<DownloadTaskResponse> getUserDownloadTasks() {
        Long userId = AuthUtil.getUserId();
        List<DownloadTask> tasks = downloadTaskMapper.getDownloadTasksByUserId(userId);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void controlDownloadTask(Long taskId, DownloadTaskActionRequest request) {
        DownloadTask task = downloadTaskMapper.getDownloadTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("下载任务不存在");
        }
        
        String action = request.getAction();
        
        switch (action) {
            case "pause":
                downloadTaskMapper.updateTaskStatus(taskId, "paused");
                break;
            case "resume":
                downloadTaskMapper.updateTaskStatus(taskId, "downloading");
                break;
            case "cancel":
                downloadTaskMapper.deleteDownloadTask(taskId);
                downloadTaskMapper.deleteChunksByTaskId(taskId);
                break;
            default:
                throw new RuntimeException("不支持的操作: " + action);
        }
    }

    @Override
    @Transactional
    public void deleteDownloadTask(Long taskId) {
        DownloadTask task = downloadTaskMapper.getDownloadTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("下载任务不存在");
        }
        downloadTaskMapper.deleteDownloadTask(taskId);
        downloadTaskMapper.deleteChunksByTaskId(taskId);
    }

    @Override
    public void updateDownloadProgress(Long taskId, Integer progress, String downloadSpeed) {
        downloadTaskMapper.updateTaskProgress(taskId, progress, downloadSpeed);
    }

    @Override
    @Transactional
    public void markDownloadTaskCompleted(Long taskId) {
        downloadTaskMapper.markTaskCompleted(taskId);
    }

    @Override
    @Transactional
    public void markDownloadTaskFailed(Long taskId, String errorMessage) {
        downloadTaskMapper.updateTaskError(taskId, errorMessage);
    }

    private DownloadTaskResponse mapToResponse(DownloadTask task) {
        DownloadTaskResponse response = new DownloadTaskResponse();
        response.setId(task.getId());
        response.setTaskName(task.getTaskName());
        response.setDownloadUrl(task.getDownloadUrl());
        response.setDownloadType(task.getDownloadType());
        response.setFileName(task.getFileName());
        response.setFileSize(task.getFileSize());
        response.setSavePath(task.getSavePath());
        response.setStatus(task.getStatus());
        response.setProgress(task.getProgress());
        response.setDownloadSpeed(task.getDownloadSpeed());
        response.setErrorMessage(task.getErrorMessage());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setCompletedAt(task.getCompletedAt());
        return response;
    }
}
