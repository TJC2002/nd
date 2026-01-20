package com.example.nd.config;

import com.example.nd.service.TaskHandler;
import com.example.nd.service.TaskManagerService;
import com.example.nd.service.impl.handlers.BaseTaskHandler;
import com.example.nd.service.impl.handlers.DocumentThumbnailHandler;
import com.example.nd.service.impl.handlers.FileExtractHandler;
import com.example.nd.service.impl.handlers.VideoCompressHandler;
import com.example.nd.service.impl.handlers.VideoConvertHandler;
import com.example.nd.service.impl.handlers.VideoThumbnailHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class TaskHandlerConfig {

    @Autowired
    private TaskManagerService taskManagerService;

    @Autowired
    private FileExtractHandler fileExtractHandler;

    @Autowired
    private VideoConvertHandler videoConvertHandler;

    @Autowired
    private VideoCompressHandler videoCompressHandler;

    @Autowired
    private VideoThumbnailHandler videoThumbnailHandler;

    @Autowired
    private DocumentThumbnailHandler documentThumbnailHandler;

    @PostConstruct
    public void registerTaskHandlers() {
        // 注册文件解压处理器
        taskManagerService.registerHandler(fileExtractHandler);
        
        // 注册视频转换处理器
        taskManagerService.registerHandler(videoConvertHandler);
        
        // 注册视频压缩处理器
        taskManagerService.registerHandler(videoCompressHandler);
        
        // 注册视频封面提取处理器
        taskManagerService.registerHandler(videoThumbnailHandler);
        
        // 注册文档封面生成处理器
        taskManagerService.registerHandler(documentThumbnailHandler);
        
        System.out.println("Task handlers registered successfully");
    }
}
