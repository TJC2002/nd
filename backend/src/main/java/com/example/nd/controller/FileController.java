package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.model.FileInfo;
import com.example.nd.service.FileService;
import cn.dev33.satoken.stp.StpUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/files")
@Tag(name = "文件管理", description = "文件操作相关接口")
public class FileController {

    @Autowired
    private FileService fileService;


    @GetMapping
    @Operation(summary = "获取文件列表", description = "根据文件夹ID获取文件列表")
    public ApiResponse<List<FileInfo>> getFilesByFolderId(@RequestParam(required = false) Long folderId) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            List<FileInfo> files = fileService.getFilesByUserId(userId);
            return ApiResponse.success(files);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @PostMapping("/upload")
    @Operation(summary = "上传文件", description = "上传单个文件")
    public ApiResponse<FileInfo> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(required = false) Long parentFolderId) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            FileInfo fileInfo = fileService.uploadFile(userId, file, parentFolderId);
            return ApiResponse.success(fileInfo);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @GetMapping("/{fileId}")
    @Operation(summary = "获取文件信息", description = "根据文件ID获取文件详细信息")
    public ApiResponse<FileInfo> getFileById(@PathVariable Long fileId) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            FileInfo fileInfo = fileService.getFileById(fileId);
            if (fileInfo != null) {
                return ApiResponse.success(fileInfo);
            }
            return ApiResponse.error("File not found");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @GetMapping("/{fileId}/download")
    @Operation(summary = "下载文件", description = "下载指定文件")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            FileInfo file = fileService.getFileById(fileId);
            if (file != null && !file.getIsDeleted()) {
                try {
                    Path filePath = Paths.get(file.getStoragePath());
                    Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getOriginalName() + "\"")
                            .contentType(MediaType.parseMediaType(file.getMimeType()))
                            .body(resource);
                } catch (IOException e) {
                    return ResponseEntity.internalServerError().build();
                }
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PutMapping("/{fileId}/move")
    @Operation(summary = "移动文件", description = "将文件移动到指定文件夹")
    public ApiResponse<String> moveFile(@PathVariable Long fileId, @RequestBody FileMoveRequest request) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            fileService.moveFile(fileId, request.getTargetFolderId());
            return ApiResponse.success("File moved successfully");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @PutMapping("/{fileId}/rename")
    @Operation(summary = "重命名文件", description = "重命名文件")
    public ApiResponse<String> renameFile(@PathVariable Long fileId, @RequestBody FileRenameRequest request) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            fileService.renameFile(fileId, request.getNewName());
            return ApiResponse.success("File renamed successfully");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "删除文件", description = "删除指定文件")
    public ApiResponse<String> deleteFile(@PathVariable Long fileId) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            fileService.deleteFile(fileId);
            return ApiResponse.success("File deleted successfully");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

}