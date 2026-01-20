package com.example.nd.service;

import com.example.nd.dto.TaskResponse;
import com.example.nd.model.AsyncTask;

import java.util.List;

public interface TaskManagerService {
    
    /**
     * 提交任务
     * @param userId 用户ID
     * @param fileId 文件ID
     * @param taskType 任务类型
     * @param taskParams 任务参数（JSON格式）
     * @return 任务ID
     */
    Long submitTask(Long userId, Long fileId, String taskType, String taskParams);
    
    /**
     * 获取任务状态
     * @param taskId 任务ID
     * @return 任务信息
     */
    AsyncTask getTaskStatus(Long taskId);
    
    /**
     * 获取用户的所有任务
     * @param userId 用户ID
     * @return 任务列表
     */
    List<AsyncTask> getUserTasks(Long userId);
    
    /**
     * 获取文件的所有任务
     * @param fileId 文件ID
     * @return 任务列表
     */
    List<AsyncTask> getFileTasks(Long fileId);
    
    /**
     * 取消任务
     * @param taskId 任务ID
     */
    void cancelTask(Long taskId);
    
    /**
     * 暂停任务
     * @param taskId 任务ID
     */
    void pauseTask(Long taskId);
    
    /**
     * 恢复任务
     * @param taskId 任务ID
     */
    void resumeTask(Long taskId);
    
    /**
     * 更新任务进度
     * @param taskId 任务ID
     * @param progress 进度（0-100）
     * @param message 进度消息
     */
    void updateTaskProgress(Long taskId, int progress, String message);
    
    /**
     * 完成任务
     * @param taskId 任务ID
     * @param resultData 结果数据
     */
    void completeTask(Long taskId, String resultData);
    
    /**
     * 失败任务
     * @param taskId 任务ID
     * @param errorDetails 错误详情
     */
    void failTask(Long taskId, String errorDetails);
    
    /**
     * 注册任务处理器
     * @param handler 任务处理器
     */
    void registerHandler(TaskHandler handler);
}
