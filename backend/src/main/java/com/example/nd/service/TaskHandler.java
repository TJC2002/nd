package com.example.nd.service;

import com.example.nd.model.AsyncTask;

public interface TaskHandler {
    
    /**
     * 处理任务
     * @param task 异步任务对象
     */
    void handleTask(AsyncTask task) throws Exception;
    
    /**
     * 取消任务
     * @param task 异步任务对象
     */
    void cancelTask(AsyncTask task);
    
    /**
     * 暂停任务
     * @param task 异步任务对象
     */
    void pauseTask(AsyncTask task);
    
    /**
     * 恢复任务
     * @param task 异步任务对象
     */
    void resumeTask(AsyncTask task);
    
    /**
     * 获取任务进度
     * @param task 异步任务对象
     * @return 进度百分比（0-100）
     */
    int getProgress(AsyncTask task);
    
    /**
     * 获取任务处理器支持的任务类型
     * @return 任务类型代码
     */
    String getSupportedTaskType();
}
