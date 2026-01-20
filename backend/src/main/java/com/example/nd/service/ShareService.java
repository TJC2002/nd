package com.example.nd.service;

import com.example.nd.dto.CreateShareRequest;
import com.example.nd.dto.ShareResponse;
import com.example.nd.dto.VerifyShareRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ShareService {
    ShareResponse createShare(Long userId, CreateShareRequest request);

    ShareResponse verifyShare(VerifyShareRequest request, String ipAddress, String userAgent);

    List<ShareResponse> getUserShares(Long userId);

    ShareResponse getShareByCode(String shareCode, String ipAddress, String userAgent);

    void revokeShare(Long userId, Long shareId);

    void deleteShare(Long userId, Long shareId);

    void updateShareStatus();

    void downloadSharedFile(String shareCode, String password, HttpServletResponse response, String ipAddress, String userAgent) throws IOException;
}
