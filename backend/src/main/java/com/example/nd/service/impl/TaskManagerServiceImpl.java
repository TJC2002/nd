package com.example.nd.service.impl;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.TaskMapper;
import com.example.nd.model.AsyncTask;
import com.example.nd.model.File;
import com.example.nd.service.TaskHandler;
import com.example.nd.service.TaskManagerService;
import com.example.nd.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class TaskManagerServiceImpl implements TaskManagerService {

    @Autowired
    private TaskMapper taskMapper;

    @Autowired
    private FileMapper fileMapper;

    private final Map<String, TaskHandler> taskHandlers = new HashMap<>();

    @Override
    @Transactional
    public Long submitTask(Long userId, Long fileId, String taskType, String taskParams) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }

        AsyncTask task = new AsyncTask();
        task.setUserId(userId);
        task.setFileId(fileId);
        task.setTaskType(taskType);
        task.setStatus("pending");
        task.setProgress(0);
        task.setMessage("任务已提交，等待处理");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        taskMapper.insertTask(task);

        // 异步执行任务
        executeTaskAsync(task);

        return task.getId();
    }

    @Override
    public AsyncTask getTaskStatus(Long taskId) {
        return taskMapper.getTaskById(taskId);
    }

    @Override
    public List<AsyncTask> getUserTasks(Long userId) {
        return taskMapper.getTasksByUserId(userId);
    }

    @Override
    public List<AsyncTask> getFileTasks(Long fileId) {
        return taskMapper.getTasksByFileId(fileId);
    }

    @Override
    @Transactional
    public void cancelTask(Long taskId) {
        AsyncTask task = taskMapper.getTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        if (!"pending".equals(task.getStatus()) && !"processing".equals(task.getStatus())) {
            throw new RuntimeException("Task cannot be cancelled in current status");
        }

        TaskHandler handler = taskHandlers.get(task.getTaskType());
        if (handler != null) {
            handler.cancelTask(task);
        }

        task.setStatus("cancelled");
        task.setMessage("任务已取消");
        task.setCompletedAt(LocalDateTime.now());
        taskMapper.updateTask(task);
    }

    @Override
    @Transactional
    public void pauseTask(Long taskId) {
        AsyncTask task = taskMapper.getTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        if (!"processing".equals(task.getStatus())) {
            throw new RuntimeException("Task cannot be paused in current status");
        }

        TaskHandler handler = taskHandlers.get(task.getTaskType());
        if (handler != null) {
            handler.pauseTask(task);
        }

        task.setStatus("paused");
        task.setMessage("任务已暂停");
        taskMapper.updateTask(task);
    }

    @Override
    @Transactional
    public void resumeTask(Long taskId) {
        AsyncTask task = taskMapper.getTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        if (!"paused".equals(task.getStatus())) {
            throw new RuntimeException("Task cannot be resumed in current status");
        }

        task.setStatus("processing");
        task.setMessage("任务已恢复");
        task.setUpdatedAt(LocalDateTime.now());
        taskMapper.updateTask(task);

        TaskHandler handler = taskHandlers.get(task.getTaskType());
        if (handler != null) {
            handler.resumeTask(task);
        }
    }

    @Override
    @Transactional
    public void updateTaskProgress(Long taskId, int progress, String message) {
        taskMapper.updateTaskProgress(taskId, progress, message);
    }

    @Override
    @Transactional
    public void completeTask(Long taskId, String resultData) {
        AsyncTask task = taskMapper.getTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        task.setStatus("completed");
        task.setProgress(100);
        task.setMessage("任务已完成");
        task.setResultData(resultData);
        task.setCompletedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        taskMapper.updateTask(task);
    }

    @Override
    @Transactional
    public void failTask(Long taskId, String errorDetails) {
        AsyncTask task = taskMapper.getTaskById(taskId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        task.setStatus("failed");
        task.setMessage("任务执行失败");
        task.setErrorDetails(errorDetails);
        task.setCompletedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        taskMapper.updateTask(task);
    }

    @Override
    public void registerHandler(TaskHandler handler) {
        taskHandlers.put(handler.getSupportedTaskType(), handler);
    }

    @Async
    protected void executeTaskAsync(AsyncTask task) {
        try {
            // 更新任务状态为处理中
            task.setStatus("processing");
            task.setMessage("任务开始处理");
            task.setStartedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
            taskMapper.updateTask(task);

            // 获取对应的任务处理器
            TaskHandler handler = taskHandlers.get(task.getTaskType());
            if (handler == null) {
                throw new RuntimeException("No handler found for task type: " + task.getTaskType());
            }

            // 执行任务
            handler.handleTask(task);

        } catch (Exception e) {
            // 任务执行失败
            failTask(task.getId(), e.getMessage());
        }
    }
}
