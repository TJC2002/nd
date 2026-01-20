package com.example.nd.service;

import com.example.nd.model.FileInfo;

import java.util.List;

public interface RecycleBinService {
    List<FileInfo> getRecycleBinFiles(Long userId);

    void restoreFile(Long userId, Long fileId);

    void restoreAllFiles(Long userId);

    void deletePermanently(Long userId, Long fileId);

    void deleteAllPermanently(Long userId);

    void emptyRecycleBin(Long userId);

    void cleanExpiredFiles();
}
