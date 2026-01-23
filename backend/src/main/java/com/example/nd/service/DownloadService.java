package com.example.nd.service;

import com.example.nd.dto.CreateDownloadTaskRequest;
import com.example.nd.dto.DownloadTaskActionRequest;
import com.example.nd.dto.DownloadTaskResponse;

import java.util.List;

public interface DownloadService {
    DownloadTaskResponse createDownloadTask(CreateDownloadTaskRequest request);
    DownloadTaskResponse getDownloadTask(Long taskId);
    List<DownloadTaskResponse> getUserDownloadTasks();
    void controlDownloadTask(Long taskId, DownloadTaskActionRequest request);
    void deleteDownloadTask(Long taskId);
    void updateDownloadProgress(Long taskId, Integer progress, String downloadSpeed);
    void markDownloadTaskCompleted(Long taskId);
    void markDownloadTaskFailed(Long taskId, String errorMessage);
}
