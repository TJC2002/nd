package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import com.example.nd.model.UploadTask;
import com.example.nd.service.CoverService;
import com.example.nd.service.FileSearchService;
import com.example.nd.service.FileService;
import com.example.nd.service.UploadService;
import com.example.nd.util.AuthUtil;
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

    @Autowired
    private UploadService uploadService;
    
    @Autowired
    private CoverService coverService;
    
    @Autowired
    private FileMetadataMapper fileMetadataMapper;
    
    @Autowired
    private FileSearchService fileSearchService;


    @GetMapping
    @Operation(summary = "获取文件列表", description = "根据文件夹ID获取文件列表")
    public ApiResponse<List<FileInfo>> getFilesByFolderId(@RequestParam(required = false) Long folderId) {
        Long userId = AuthUtil.getUserId();
        List<FileInfo> files;
        if (folderId == null || folderId == 0) {
            files = fileService.getRootFiles(userId);
        } else {
            files = fileService.getFilesByFolderId(folderId);
        }
        return ApiResponse.success(files);
    }

    @GetMapping("/path")
    @Operation(summary = "获取文件夹路径", description = "根据文件夹ID获取从根目录到该文件夹的完整路径")
    public ApiResponse<List<FileInfo>> getFolderPath(@RequestParam(required = false) Long folderId) {
        Long userId = AuthUtil.getUserId();
        List<FileInfo> path = fileService.getFolderPath(folderId, userId);
        return ApiResponse.success(path);
    }

    @GetMapping("/search")
    @Operation(summary = "搜索文件", description = "根据关键词、文件类型、大小、日期等条件搜索文件")
    public ApiResponse<List<SearchResult>> searchFiles(@RequestParam(required = false) String keyword,
                                                     @RequestParam(required = false) String fileType,
                                                     @RequestParam(required = false) Long minSize,
                                                     @RequestParam(required = false) Long maxSize,
                                                     @RequestParam(required = false) Long folderId,
                                                     @RequestParam(required = false) String startDate,
                                                     @RequestParam(required = false) String endDate,
                                                     @RequestParam(required = false) String sortBy,
                                                     @RequestParam(required = false) String sortOrder,
                                                     @RequestParam(required = false, defaultValue = "0") Integer page,
                                                     @RequestParam(required = false, defaultValue = "20") Integer pageSize) {
        Long userId = AuthUtil.getUserId();
        SearchRequest request = new SearchRequest();
        request.setKeyword(keyword);
        request.setFileType(fileType);
        request.setMinSize(minSize);
        request.setMaxSize(maxSize);
        request.setFolderId(folderId);
        
        if (startDate != null && !startDate.isEmpty()) {
            request.setStartDate(java.time.LocalDateTime.parse(startDate));
        }
        if (endDate != null && !endDate.isEmpty()) {
            request.setEndDate(java.time.LocalDateTime.parse(endDate));
        }
        
        request.setSortBy(sortBy);
        request.setSortOrder(sortOrder);
        request.setPage(page);
        request.setPageSize(pageSize);
        request.setOffset(page * pageSize);
        
        List<SearchResult> results = fileSearchService.searchFiles(userId, request);
        return ApiResponse.success(results);
    }

    @PostMapping("/upload")
    @Operation(summary = "上传文件", description = "上传单个文件")
    public ApiResponse<FileInfo> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(required = false) Long parentFolderId) {
        Long userId = AuthUtil.getUserId();
        FileInfo fileInfo = fileService.uploadFile(userId, file, parentFolderId);
        return ApiResponse.success(fileInfo);
    }

    @GetMapping("/{fileId}")
    @Operation(summary = "获取文件信息", description = "根据文件ID获取文件详细信息")
    public ApiResponse<FileInfo> getFileById(@PathVariable Long fileId) {
        Long userId = AuthUtil.getUserId();
        FileInfo fileInfo = fileService.getFileById(fileId);
        if (fileInfo != null) {
            return ApiResponse.success(fileInfo);
        }
        return ApiResponse.error("File not found");
    }

    @GetMapping("/{fileId}/download")
    @Operation(summary = "下载文件", description = "下载指定文件")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        Long userId = AuthUtil.getUserId();
        FileInfo file = fileService.getFileById(fileId);
        if (file != null && file.getDeletedAt() == null) {
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
    }

    @PutMapping("/{fileId}/move")
    @Operation(summary = "移动文件", description = "将文件移动到指定文件夹")
    public ApiResponse<String> moveFile(@PathVariable Long fileId, @RequestBody FileMoveRequest request) {
        Long userId = AuthUtil.getUserId();
        fileService.moveFile(fileId, request.getTargetFolderId());
        return ApiResponse.success("File moved successfully");
    }

    @PutMapping("/{fileId}/rename")
    @Operation(summary = "重命名文件", description = "重命名文件")
    public ApiResponse<String> renameFile(@PathVariable Long fileId, @RequestBody FileRenameRequest request) {
        Long userId = AuthUtil.getUserId();
        fileService.renameFile(fileId, request.getNewName());
        return ApiResponse.success("File renamed successfully");
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "删除文件", description = "删除指定文件")
    public ApiResponse<String> deleteFile(@PathVariable Long fileId) {
        Long userId = AuthUtil.getUserId();
        fileService.deleteFile(fileId);
        return ApiResponse.success("File deleted successfully");
    }

    @PostMapping("/folders")
    @Operation(summary = "创建文件夹", description = "创建新文件夹")
    public ApiResponse<FileInfo> createFolder(@RequestBody FolderCreateRequest request) {
        Long userId = AuthUtil.getUserId();
        FileInfo folder = fileService.createFolder(userId, request.getFolderName(), request.getParentFolderId());
        return ApiResponse.success(folder);
    }

    @PostMapping("/check")
    @Operation(summary = "秒传检查", description = "检查文件是否已存在")
    public ApiResponse<CheckFileResponse> checkFileExist(@RequestBody CheckFileRequest request) {
        CheckFileResponse response = uploadService.checkFileExist(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/upload/init")
    @Operation(summary = "上传初始化", description = "初始化上传任务")
    public ApiResponse<UploadInitResponse> initializeUpload(@RequestBody UploadInitRequest request) {
        UploadInitResponse response = uploadService.initializeUpload(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/upload/chunk")
    @Operation(summary = "分片上传", description = "上传文件分片")
    public ApiResponse<String> uploadChunk(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("chunkIndex") Integer chunkIndex,
            @RequestParam("chunkData") MultipartFile chunkData) {
        uploadService.uploadChunk(uploadId, chunkIndex, chunkData);
        return ApiResponse.success("Chunk uploaded successfully");
    }

    @PostMapping("/upload/complete")
    @Operation(summary = "完成上传", description = "完成上传，合并分片")
    public ApiResponse<FileInfo> completeUpload(@RequestBody UploadCompleteRequest request) {
        File file = uploadService.completeUpload(request);
        FileInfo fileInfo = new FileInfo();
        fileInfo.setId(file.getId());
        fileInfo.setUserId(file.getUserId());
        fileInfo.setParentFolderId(file.getParentId());
        fileInfo.setFileName(file.getName());
        fileInfo.setOriginalName(file.getName());
        fileInfo.setCreatedAt(file.getCreatedAt());
        fileInfo.setUpdatedAt(file.getUpdatedAt());
        fileInfo.setDeletedAt(file.getDeletedAt());
        fileInfo.setIsFolder(file.getIsFolder());
        return ApiResponse.success(fileInfo);
    }

    @GetMapping("/upload/status/{uploadId}")
    @Operation(summary = "获取上传状态", description = "获取上传状态")
    public ApiResponse<UploadTask> getUploadStatus(@PathVariable String uploadId) {
        UploadTask uploadTask = uploadService.getUploadStatus(uploadId);
        return ApiResponse.success(uploadTask);
    }

    @PostMapping("/upload/cancel/{uploadId}")
    @Operation(summary = "取消上传", description = "取消上传任务")
    public ApiResponse<String> cancelUpload(@PathVariable String uploadId) {
        uploadService.cancelUpload(uploadId);
        return ApiResponse.success("Upload cancelled successfully");
    }
    
    @GetMapping("/{fileId}/cover")
    @Operation(summary = "获取文件封面", description = "获取文件的封面图片")
    public ResponseEntity<Resource> getFileCover(@PathVariable Long fileId, @RequestParam(required = false) String size) {
        try {
            Path coverPath = coverService.getCover(fileId, size);
            if (coverPath != null && Files.exists(coverPath)) {
                Resource resource = new org.springframework.core.io.UrlResource(coverPath.toUri());
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"cover.jpg\"")
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}