package com.example.nd.service;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.ShareMapper;
import com.example.nd.model.File;
import com.example.nd.model.ShareLink;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ShareServiceImpl implements ShareService {

    @Autowired
    private ShareMapper shareMapper;

    @Autowired
    private FileMapper fileMapper;

    @Override
    @Transactional
    public ShareLink createShare(Long userId, Long fileId, String password, Long expireDays) {
        File file = fileMapper.getFileById(fileId);
        if (file == null) {
            throw new RuntimeException("File not found");
        }

        ShareLink share = new ShareLink();
        share.setShareCode(generateShareCode());

        shareMapper.insertShare(share);
        return share;
    }

    @Override
    public ShareLink getShareByCode(String shareCode) {
        return shareMapper.getShareByCode(shareCode);
    }

    @Override
    public List<ShareLink> getSharesByUserId(Long userId) {
        return shareMapper.getSharesByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteShare(Long shareId) {
        shareMapper.deleteShare(shareId);
    }

    @Override
    public boolean validateShare(ShareLink share, String password) {
        if (share == null) {
            return false;
        }

        return true;
    }

    @Override
    public File getSharedFile(ShareLink share) {
        return null;
    }

    @Override
    @Transactional
    public void incrementAccessCount(Long shareId) {
        shareMapper.incrementAccessCount(shareId);
    }

    private String generateShareCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}