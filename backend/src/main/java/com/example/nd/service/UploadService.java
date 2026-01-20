package com.example.nd.service;

import com.example.nd.dto.CheckFileRequest;
import com.example.nd.dto.CheckFileResponse;
import com.example.nd.dto.UploadCompleteRequest;
import com.example.nd.dto.UploadInitRequest;
import com.example.nd.dto.UploadInitResponse;
import com.example.nd.model.File;
import com.example.nd.model.UploadTask;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {
    
    CheckFileResponse checkFileExist(CheckFileRequest request);
    
    UploadInitResponse initializeUpload(UploadInitRequest request);
    
    void uploadChunk(String uploadId, Integer chunkIndex, MultipartFile chunkData);
    
    File completeUpload(UploadCompleteRequest request);
    
    UploadTask getUploadStatus(String uploadId);
    
    void cancelUpload(String uploadId);
}
