package com.example.nd.service.impl.handlers;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.AsyncTask;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class VideoThumbnailHandler extends BaseTaskHandler {

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    private static final String FFMPEG_PATH = "ffmpeg";

    @Override
    public void handleTask(AsyncTask task) throws Exception {
        File file = fileMapper.getFileById(task.getFileId());
        if (file == null) {
            throw new RuntimeException("File not found");
        }

        String filePath = file.getStoragePath();
        if (!file.getMimeType().startsWith("video/")) {
            throw new RuntimeException("Unsupported file type for video thumbnail extraction");
        }

        updateProgress(task, 5, "开始提取视频封面");

        try {
            Path sourcePath = Paths.get(filePath);
            String thumbnailPath = null;
            
            if (thumbnailPath == null || thumbnailPath.isEmpty()) {
                thumbnailPath = Paths.get(sourcePath.getParent().toString(), 
                    file.getName().substring(0, file.getName().lastIndexOf('.')) + "_thumbnail.jpg").toString();
            }
            
            Path thumbnailFilePath = Paths.get(thumbnailPath);
            
            // 构建FFmpeg封面提取命令
            ProcessBuilder pb = new ProcessBuilder(
                FFMPEG_PATH,
                "-i", sourcePath.toString(),
                "-ss", "00:00:01", // 提取第1秒的帧
                "-vframes", "1", // 只提取1帧
                "-vf", "scale=256:-1", // 缩放到256像素宽
                "-q:v", "2", // 图片质量
                thumbnailFilePath.toString()
            );
            
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            updateProgress(task, 50, "提取视频帧中");
            
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg thumbnail extraction failed with exit code: " + exitCode);
            }
            
            if (!Files.exists(thumbnailFilePath)) {
                throw new RuntimeException("Thumbnail file was not created");
            }
            
            updateProgress(task, 100, "视频封面提取完成");
            
            // 创建封面提取结果数据
            long thumbnailSize = Files.size(thumbnailFilePath);
            String resultData = String.format(
                "{\"videoFile\":\"%s\",\"thumbnailFile\":\"%s\",\"thumbnailSize\":%d}", 
                filePath, thumbnailPath, thumbnailSize);
            
            completeTask(task, resultData);
        } catch (Exception e) {
            failTask(task, "视频封面提取失败: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public String getSupportedTaskType() {
        return "video_thumbnail";
    }
}
