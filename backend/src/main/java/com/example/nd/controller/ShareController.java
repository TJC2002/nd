package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import com.example.nd.model.ShareLink;
import com.example.nd.service.FileService;
import com.example.nd.service.ShareService;
import cn.dev33.satoken.stp.StpUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/shares")
@Tag(name = "分享管理", description = "文件分享相关接口")
public class ShareController {

    @Autowired
    private ShareService shareService;

    @Autowired
    private FileService fileService;

    @GetMapping
    @Operation(summary = "获取分享记录", description = "获取用户的所有分享记录")
    public ApiResponse<List<ShareLink>> getShares() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            List<ShareLink> shares = shareService.getSharesByUserId(userId);
            return ApiResponse.success(shares);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @PostMapping
    @Operation(summary = "创建分享链接", description = "为指定文件创建分享链接")
    public ApiResponse<ShareLink> createShare(@RequestBody CreateShareRequest request) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            ShareLink share = shareService.createShare(userId, request.getFileId(), request.getPassword(), request.getExpireDays());
            return ApiResponse.success(share);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @GetMapping("/{shareCode}")
    @Operation(summary = "验证分享链接", description = "验证分享链接是否有效")
    public ApiResponse<ShareLink> getShareByCode(@PathVariable String shareCode) {
        ShareLink share = shareService.getShareByCode(shareCode);
        if (share != null) {
            return ApiResponse.success(share);
        }
        return ApiResponse.error("Share link not found");
    }

    @PostMapping("/{shareCode}/access")
    @Operation(summary = "访问分享链接", description = "验证密码并访问分享的文件")
    public ApiResponse<FileInfo> accessShare(@PathVariable String shareCode, @RequestBody AccessShareRequest request) {
        ShareLink share = shareService.getShareByCode(shareCode);
        if (share == null) {
            return ApiResponse.error("Share link not found");
        }

        if (!shareService.validateShare(share, request.getPassword())) {
            return ApiResponse.error("Invalid password or expired share link");
        }

        shareService.incrementAccessCount(share.getId());
        File file = shareService.getSharedFile(share);
        if (file == null) {
            return ApiResponse.error("File not found");
        }

        FileInfo fileInfo = new FileInfo();
        fileInfo.setId(file.getId());
        fileInfo.setUserId(file.getUserId());
        fileInfo.setParentFolderId(file.getParentFolderId());
        fileInfo.setFileName(file.getFileName());
        fileInfo.setOriginalName(file.getOriginalName());
        fileInfo.setFileSize(file.getFileSize());
        fileInfo.setMimeType(file.getMimeType());
        fileInfo.setFileHash(file.getFileHash());
        fileInfo.setStoragePath(file.getStoragePath());
        fileInfo.setStorageType(file.getStorageType());
        fileInfo.setVersion(file.getVersion());
        fileInfo.setIsDeleted(file.getIsDeleted());
        fileInfo.setCreatedAt(file.getCreatedAt());
        fileInfo.setUpdatedAt(file.getUpdatedAt());

        return ApiResponse.success(fileInfo);
    }

    @GetMapping("/{shareCode}/download")
    @Operation(summary = "下载分享文件", description = "下载分享的文件")
    public ResponseEntity<Resource> downloadSharedFile(@PathVariable String shareCode, @RequestParam(required = false) String password) {
        ShareLink share = shareService.getShareByCode(shareCode);
        if (share == null) {
            return ResponseEntity.notFound().build();
        }

        if (!shareService.validateShare(share, password)) {
            return ResponseEntity.status(403).build();
        }

        shareService.incrementAccessCount(share.getId());
        File file = shareService.getSharedFile(share);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            var filePath = Paths.get(file.getStoragePath());
            Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getOriginalName() + "\"")
                    .contentType(MediaType.parseMediaType(file.getMimeType()))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{shareId}")
    @Operation(summary = "撤销分享链接", description = "撤销指定的分享链接")
    public ApiResponse<String> deleteShare(@PathVariable Long shareId) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            ShareLink share = shareService.getShareByCode(shareId.toString());
            if (share != null && share.getUserId().equals(userId)) {
                shareService.deleteShare(shareId);
                return ApiResponse.success("Share link deleted successfully");
            }
            return ApiResponse.error("You don't have permission to delete this share");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "获取分享统计", description = "获取用户的分享统计信息")
    public ApiResponse<ShareStatsResponse> getShareStats() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            List<ShareLink> shares = shareService.getSharesByUserId(userId);
            long totalShares = shares.size();
            long totalAccessCount = shares.stream().mapToLong(ShareLink::getAccessCount).sum();

            ShareStatsResponse response = new ShareStatsResponse();
            response.setTotalShares(totalShares);
            response.setTotalAccessCount(totalAccessCount);
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }
}