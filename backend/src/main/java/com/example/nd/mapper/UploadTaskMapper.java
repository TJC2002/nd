package com.example.nd.mapper;

import com.example.nd.model.UploadTask;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UploadTaskMapper {
    
    UploadTask getUploadTaskById(Long id);
    
    UploadTask getUploadTaskByUploadId(String uploadId);
    
    int insertUploadTask(UploadTask uploadTask);
    
    int updateUploadTask(UploadTask uploadTask);
    
    int deleteUploadTask(Long id);
    
    int deleteUploadTaskByUploadId(String uploadId);
    
    int updateUploadedChunks(String uploadId, String uploadedChunks);
}
