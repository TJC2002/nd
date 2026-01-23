package com.example.nd.mapper;

import com.example.nd.model.DownloadTask;
import com.example.nd.model.DownloadChunk;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DownloadTaskMapper {
    // DownloadTask methods
    void insertDownloadTask(DownloadTask task);
    void updateDownloadTask(DownloadTask task);
    void deleteDownloadTask(@Param("id") Long id);
    DownloadTask getDownloadTaskById(@Param("id") Long id);
    List<DownloadTask> getDownloadTasksByUserId(@Param("userId") Long userId);
    List<DownloadTask> getDownloadTasksByStatus(@Param("status") String status);
    void updateTaskStatus(@Param("id") Long id, @Param("status") String status);
    void updateTaskProgress(@Param("id") Long id, @Param("progress") Integer progress, @Param("downloadSpeed") String downloadSpeed);
    void updateTaskError(@Param("id") Long id, @Param("errorMessage") String errorMessage);
    void markTaskCompleted(@Param("id") Long id);
    
    // DownloadChunk methods
    void insertDownloadChunk(DownloadChunk chunk);
    void updateDownloadChunk(DownloadChunk chunk);
    void deleteDownloadChunk(@Param("id") Long id);
    void deleteChunksByTaskId(@Param("taskId") Long taskId);
    DownloadChunk getDownloadChunkById(@Param("id") Long id);
    List<DownloadChunk> getChunksByTaskId(@Param("taskId") Long taskId);
}
