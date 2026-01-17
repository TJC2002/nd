package com.example.nd.service;

import com.example.nd.model.ShareLink;
import com.example.nd.model.File;

import java.util.List;

public interface ShareService {
    
    ShareLink createShare(Long userId, Long fileId, String password, Long expireDays);
    
    ShareLink getShareByCode(String shareCode);
    
    List<ShareLink> getSharesByUserId(Long userId);
    
    void deleteShare(Long shareId);
    
    boolean validateShare(ShareLink share, String password);
    
    File getSharedFile(ShareLink share);
    
    void incrementAccessCount(Long shareId);
}