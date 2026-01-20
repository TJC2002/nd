package com.example.nd.service.impl;

import com.example.nd.dto.ApiResponse;
import com.example.nd.dto.CreateShareRequest;
import com.example.nd.dto.ShareResponse;
import com.example.nd.dto.VerifyShareRequest;
import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.mapper.ShareAccessLogMapper;
import com.example.nd.mapper.ShareMapper;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;
import com.example.nd.model.Share;
import com.example.nd.model.ShareAccessLog;
import com.example.nd.service.ShareService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShareServiceImpl implements ShareService {

    @Autowired
    private ShareMapper shareMapper;

    @Autowired
    private ShareAccessLogMapper shareAccessLogMapper;

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    @Value("${app.share.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    @Transactional
    public ShareResponse createShare(Long userId, CreateShareRequest request) {
        // 验证文件是否存在且属于该用户
        File file = fileMapper.getFileById(request.getFileId());
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("无权分享此文件");
        }

        // 生成唯一的分享码
        String shareCode = generateShareCode();
        
        // 生成分享链接
        String shareUrl = baseUrl + "/share/" + shareCode;

        // 加密密码（如果设置了密码）
        String encryptedPassword = null;
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            encryptedPassword = encryptPassword(request.getPassword());
        }

        // 创建分享记录
        Share share = new Share();
        share.setUserId(userId);
        share.setFileId(request.getFileId());
        share.setShareCode(shareCode);
        share.setShareUrl(shareUrl);
        share.setPassword(encryptedPassword);
        share.setExpireTime(request.getExpireTime());
        share.setMaxDownloads(request.getMaxDownloads());

        shareMapper.insertShare(share);

        // 转换为响应对象
        return convertToResponse(share, file.getName());
    }

    @Override
    @Transactional
    public ShareResponse verifyShare(VerifyShareRequest request, String ipAddress, String userAgent) {
        Share share = shareMapper.getShareByCode(request.getShareCode());
        if (share == null) {
            throw new RuntimeException("分享链接不存在");
        }

        // 检查分享状态
        if (!"active".equals(share.getStatus())) {
            throw new RuntimeException("分享链接已失效");
        }

        // 检查是否过期
        if (share.getExpireTime() != null && share.getExpireTime().isBefore(LocalDateTime.now())) {
            shareMapper.expireShare(share.getId());
            throw new RuntimeException("分享链接已过期");
        }

        // 检查下载次数限制
        if (share.getMaxDownloads() != null && share.getDownloadCount() >= share.getMaxDownloads()) {
            throw new RuntimeException("分享链接已达到最大下载次数");
        }

        // 验证密码
        if (share.getPassword() != null) {
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                throw new RuntimeException("请输入访问密码");
            }
            if (!verifyPassword(request.getPassword(), share.getPassword())) {
                throw new RuntimeException("密码错误");
            }
        }

        // 记录访问日志
        ShareAccessLog accessLog = new ShareAccessLog();
        accessLog.setShareId(share.getId());
        accessLog.setIpAddress(ipAddress);
        accessLog.setUserAgent(userAgent);
        accessLog.setAction("view");
        shareAccessLogMapper.insertAccessLog(accessLog);

        // 增加查看次数
        shareMapper.incrementViewCount(share.getId());

        // 获取文件信息
        File file = fileMapper.getFileById(share.getFileId());
        return convertToResponse(share, file.getName());
    }

    @Override
    public List<ShareResponse> getUserShares(Long userId) {
        List<Share> shares = shareMapper.getSharesByUserId(userId);
        return shares.stream().map(share -> {
            File file = fileMapper.getFileById(share.getFileId());
            return convertToResponse(share, file != null ? file.getName() : "未知文件");
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShareResponse getShareByCode(String shareCode, String ipAddress, String userAgent) {
        Share share = shareMapper.getShareByCode(shareCode);
        if (share == null) {
            throw new RuntimeException("分享链接不存在");
        }

        // 检查分享状态
        if (!"active".equals(share.getStatus())) {
            throw new RuntimeException("分享链接已失效");
        }

        // 检查是否过期
        if (share.getExpireTime() != null && share.getExpireTime().isBefore(LocalDateTime.now())) {
            shareMapper.expireShare(share.getId());
            throw new RuntimeException("分享链接已过期");
        }

        // 检查下载次数限制
        if (share.getMaxDownloads() != null && share.getDownloadCount() >= share.getMaxDownloads()) {
            throw new RuntimeException("分享链接已达到最大下载次数");
        }

        // 记录访问日志
        ShareAccessLog accessLog = new ShareAccessLog();
        accessLog.setShareId(share.getId());
        accessLog.setIpAddress(ipAddress);
        accessLog.setUserAgent(userAgent);
        accessLog.setAction("view");
        shareAccessLogMapper.insertAccessLog(accessLog);

        // 增加查看次数
        shareMapper.incrementViewCount(share.getId());

        // 获取文件信息
        File file = fileMapper.getFileById(share.getFileId());
        return convertToResponse(share, file.getName());
    }

    @Override
    @Transactional
    public void revokeShare(Long userId, Long shareId) {
        Share share = shareMapper.getShareById(shareId);
        if (share == null) {
            throw new RuntimeException("分享记录不存在");
        }
        if (!share.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此分享");
        }
        shareMapper.revokeShare(shareId);
    }

    @Override
    @Transactional
    public void deleteShare(Long userId, Long shareId) {
        Share share = shareMapper.getShareById(shareId);
        if (share == null) {
            throw new RuntimeException("分享记录不存在");
        }
        if (!share.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此分享");
        }
        shareMapper.deleteShare(shareId);
    }

    @Override
    @Transactional
    public void updateShareStatus() {
        // 更新过期的分享状态
        List<Share> expiredShares = shareMapper.getExpiredShares(LocalDateTime.now());
        for (Share share : expiredShares) {
            shareMapper.expireShare(share.getId());
        }
    }

    @Override
    @Transactional
    public void downloadSharedFile(String shareCode, String password, HttpServletResponse response, String ipAddress, String userAgent) throws IOException {
        Share share = shareMapper.getShareByCode(shareCode);
        if (share == null) {
            throw new RuntimeException("分享链接不存在");
        }

        // 检查分享状态
        if (!"active".equals(share.getStatus())) {
            throw new RuntimeException("分享链接已失效");
        }

        // 检查是否过期
        if (share.getExpireTime() != null && share.getExpireTime().isBefore(LocalDateTime.now())) {
            shareMapper.expireShare(share.getId());
            throw new RuntimeException("分享链接已过期");
        }

        // 检查下载次数限制
        if (share.getMaxDownloads() != null && share.getDownloadCount() >= share.getMaxDownloads()) {
            throw new RuntimeException("分享链接已达到最大下载次数");
        }

        // 验证密码
        if (share.getPassword() != null) {
            if (password == null || password.isEmpty()) {
                throw new RuntimeException("请输入访问密码");
            }
            if (!verifyPassword(password, share.getPassword())) {
                throw new RuntimeException("密码错误");
            }
        }

        // 获取文件信息
        File file = fileMapper.getFileById(share.getFileId());
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }

        // 获取文件元数据
        FileMetadata metadata = fileMetadataMapper.getFileMetadataById(file.getMetadataId());
        if (metadata == null) {
            throw new RuntimeException("文件元数据不存在");
        }

        // 记录下载日志
        ShareAccessLog accessLog = new ShareAccessLog();
        accessLog.setShareId(share.getId());
        accessLog.setIpAddress(ipAddress);
        accessLog.setUserAgent(userAgent);
        accessLog.setAction("download");
        shareAccessLogMapper.insertAccessLog(accessLog);

        // 增加下载次数
        shareMapper.incrementDownloadCount(share.getId());

        // 设置响应头
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"");
        response.setHeader("Content-Length", String.valueOf(metadata.getSize()));

        // 这里应该调用FileService来下载文件
        // 暂时返回文件路径信息，实际实现需要集成FileService
        response.getWriter().write("文件下载功能需要集成FileService");
    }

    private String generateShareCode() {
        String shareCode;
        do {
            shareCode = generateRandomString(8);
        } while (shareMapper.getShareByCode(shareCode) != null);
        return shareCode;
    }

    private String generateRandomString(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String encryptPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("密码加密失败", e);
        }
    }

    private boolean verifyPassword(String inputPassword, String encryptedPassword) {
        return encryptPassword(inputPassword).equals(encryptedPassword);
    }

    private ShareResponse convertToResponse(Share share, String fileName) {
        ShareResponse response = new ShareResponse();
        response.setId(share.getId());
        response.setFileId(share.getFileId());
        response.setFileName(fileName);
        response.setShareCode(share.getShareCode());
        response.setShareUrl(share.getShareUrl());
        response.setHasPassword(share.getPassword() != null);
        response.setExpireTime(share.getExpireTime());
        response.setMaxDownloads(share.getMaxDownloads());
        response.setDownloadCount(share.getDownloadCount());
        response.setViewCount(share.getViewCount());
        response.setStatus(share.getStatus());
        response.setCreatedAt(share.getCreatedAt());
        response.setUpdatedAt(share.getUpdatedAt());
        return response;
    }
}
