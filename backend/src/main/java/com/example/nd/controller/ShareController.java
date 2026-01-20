package com.example.nd.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.example.nd.dto.ApiResponse;
import com.example.nd.dto.CreateShareRequest;
import com.example.nd.dto.ShareResponse;
import com.example.nd.dto.VerifyShareRequest;
import com.example.nd.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
@Tag(name = "分享管理", description = "文件分享相关接口")
public class ShareController {

    @Autowired
    private ShareService shareService;

    @PostMapping
    @SaCheckLogin
    @Operation(summary = "创建分享链接", description = "为指定文件创建分享链接")
    public ApiResponse<ShareResponse> createShare(
            @RequestBody CreateShareRequest request,
            HttpServletRequest httpRequest) {
        Long userId = StpUtil.getLoginIdAsLong();
        ShareResponse shareResponse = shareService.createShare(userId, request);
        return ApiResponse.success(shareResponse);
    }

    @PostMapping("/verify")
    @Operation(summary = "验证分享链接", description = "验证分享链接的有效性")
    public ApiResponse<ShareResponse> verifyShare(
            @RequestBody VerifyShareRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        ShareResponse shareResponse = shareService.verifyShare(request, ipAddress, userAgent);
        return ApiResponse.success(shareResponse);
    }

    @GetMapping
    @SaCheckLogin
    @Operation(summary = "获取用户分享列表", description = "获取当前用户的所有分享记录")
    public ApiResponse<List<ShareResponse>> getUserShares() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<ShareResponse> shares = shareService.getUserShares(userId);
        return ApiResponse.success(shares);
    }

    @GetMapping("/{shareCode}")
    @Operation(summary = "通过分享码获取分享信息", description = "通过分享码获取分享详情")
    public ApiResponse<ShareResponse> getShareByCode(
            @Parameter(description = "分享码") @PathVariable String shareCode,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        ShareResponse shareResponse = shareService.getShareByCode(shareCode, ipAddress, userAgent);
        return ApiResponse.success(shareResponse);
    }

    @PostMapping("/{shareId}/revoke")
    @SaCheckLogin
    @Operation(summary = "撤销分享链接", description = "撤销指定的分享链接")
    public ApiResponse<Void> revokeShare(
            @Parameter(description = "分享ID") @PathVariable Long shareId) {
        Long userId = StpUtil.getLoginIdAsLong();
        shareService.revokeShare(userId, shareId);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{shareId}")
    @SaCheckLogin
    @Operation(summary = "删除分享记录", description = "永久删除指定的分享记录")
    public ApiResponse<Void> deleteShare(
            @Parameter(description = "分享ID") @PathVariable Long shareId) {
        Long userId = StpUtil.getLoginIdAsLong();
        shareService.deleteShare(userId, shareId);
        return ApiResponse.success(null);
    }

    @GetMapping("/{shareCode}/download")
    @Operation(summary = "下载分享文件", description = "通过分享码下载文件")
    public void downloadSharedFile(
            @Parameter(description = "分享码") @PathVariable String shareCode,
            @Parameter(description = "访问密码") @RequestParam(required = false) String password,
            HttpServletResponse response,
            HttpServletRequest httpRequest) throws Exception {
        String ipAddress = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        shareService.downloadSharedFile(shareCode, password, response, ipAddress, userAgent);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}
