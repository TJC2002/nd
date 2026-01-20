package com.example.nd.mapper;

import com.example.nd.model.AsyncTask;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TaskMapper {
    
    AsyncTask getTaskById(Long taskId);
    
    List<AsyncTask> getTasksByUserId(Long userId);
    
    List<AsyncTask> getTasksByFileId(Long fileId);
    
    void insertTask(AsyncTask task);
    
    void updateTask(AsyncTask task);
    
    void updateTaskProgress(Long taskId, int progress, String message);
    
    void updateTaskStatus(Long taskId, String status);
    
    void deleteTask(Long taskId);
    
    void deleteTasksByFileId(Long fileId);
}
