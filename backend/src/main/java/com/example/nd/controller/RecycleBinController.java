package com.example.nd.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.example.nd.dto.ApiResponse;
import com.example.nd.model.FileInfo;
import com.example.nd.service.RecycleBinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recycle-bin")
@Tag(name = "回收站管理", description = "回收站相关接口")
public class RecycleBinController {

    @Autowired
    private RecycleBinService recycleBinService;

    @GetMapping
    @SaCheckLogin
    @Operation(summary = "获取回收站文件列表", description = "获取当前用户的回收站文件列表")
    public ApiResponse<List<FileInfo>> getRecycleBinFiles() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<FileInfo> files = recycleBinService.getRecycleBinFiles(userId);
        return ApiResponse.success(files);
    }

    @PostMapping("/{fileId}/restore")
    @SaCheckLogin
    @Operation(summary = "恢复文件", description = "将指定文件从回收站恢复到原位置")
    public ApiResponse<Void> restoreFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        Long userId = StpUtil.getLoginIdAsLong();
        recycleBinService.restoreFile(userId, fileId);
        return ApiResponse.success(null);
    }

    @PostMapping("/restore-all")
    @SaCheckLogin
    @Operation(summary = "恢复所有文件", description = "将回收站所有文件恢复到原位置")
    public ApiResponse<Void> restoreAllFiles() {
        Long userId = StpUtil.getLoginIdAsLong();
        recycleBinService.restoreAllFiles(userId);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{fileId}")
    @SaCheckLogin
    @Operation(summary = "永久删除文件", description = "永久删除回收站中的指定文件")
    public ApiResponse<Void> deletePermanently(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        Long userId = StpUtil.getLoginIdAsLong();
        recycleBinService.deletePermanently(userId, fileId);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/all")
    @SaCheckLogin
    @Operation(summary = "永久删除所有文件", description = "永久删除回收站中的所有文件")
    public ApiResponse<Void> deleteAllPermanently() {
        Long userId = StpUtil.getLoginIdAsLong();
        recycleBinService.deleteAllPermanently(userId);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/empty")
    @SaCheckLogin
    @Operation(summary = "清空回收站", description = "清空回收站，永久删除所有文件")
    public ApiResponse<Void> emptyRecycleBin() {
        Long userId = StpUtil.getLoginIdAsLong();
        recycleBinService.emptyRecycleBin(userId);
        return ApiResponse.success(null);
    }

    @PostMapping("/clean-expired")
    @Operation(summary = "清理过期文件", description = "清理回收站中过期的文件（系统管理员权限）")
    public ApiResponse<Void> cleanExpiredFiles() {
        recycleBinService.cleanExpiredFiles();
        return ApiResponse.success(null);
    }
}
