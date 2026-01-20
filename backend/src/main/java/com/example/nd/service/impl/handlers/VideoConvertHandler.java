package com.example.nd.service.impl.handlers;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.AsyncTask;
import com.example.nd.model.FileMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VideoConvertHandler extends BaseTaskHandler {

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    private static final String FFMPEG_PATH = "ffmpeg";

    @Override
    public void handleTask(AsyncTask task) throws Exception {
        com.example.nd.model.File file = fileMapper.getFileById(task.getFileId());
        if (file == null) {
            throw new RuntimeException("File not found");
        }

        FileMetadata metadata = fileMetadataMapper.getFileMetadataById(file.getMetadataId());
        if (metadata == null) {
            throw new RuntimeException("File metadata not found");
        }

        String filePath = metadata.getStoragePath();
        if (!metadata.getMimeType().startsWith("video/")) {
            throw new RuntimeException("Unsupported file type for video conversion");
        }

        updateProgress(task, 5, "开始视频格式转换");

        try {
            String targetFormat = getTargetFormat(task);
            Path sourcePath = Paths.get(filePath);
            Path targetPath = Paths.get(sourcePath.getParent().toString(), 
                file.getName().substring(0, file.getName().lastIndexOf('.')) + "_converted." + targetFormat);
            
            // 构建FFmpeg转换命令
            ProcessBuilder pb = new ProcessBuilder(
                FFMPEG_PATH,
                "-i", sourcePath.toString(),
                "-c:v", "libx264",
                "-preset", "medium",
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart",
                targetPath.toString()
            );
            
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // 监控转换进度
            monitorProgress(process, task);
            
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg conversion failed with exit code: " + exitCode);
            }
            
            updateProgress(task, 100, "视频转换完成");
            
            // 创建转换结果数据
            long originalSize = Files.size(sourcePath);
            long convertedSize = Files.size(targetPath);
            String resultData = String.format(
                "{\"sourceFile\":\"%s\",\"targetFile\":\"%s\",\"originalSize\":%d,\"convertedSize\":%d,\"format\":\"%s\"}", 
                filePath, targetPath.toString(), originalSize, convertedSize, targetFormat);
            
            completeTask(task, resultData);
        } catch (Exception e) {
            failTask(task, "视频转换失败: " + e.getMessage());
            throw e;
        }
    }

    private void monitorProgress(Process process, AsyncTask task) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        String line;
        Pattern durationPattern = Pattern.compile("Duration: (\\d{2}):(\\d{2}):(\\d{2})\\.(\\d{2})");
        Pattern timePattern = Pattern.compile("time=(\\d{2}):(\\d{2}):(\\d{2})");
        
        Double totalDuration = null;
        
        while ((line = reader.readLine()) != null) {
            checkPause();
            if (isTaskCancelled()) {
                process.destroy();
                throw new InterruptedException("Task was cancelled");
            }
            
            // 解析总时长
            Matcher durationMatcher = durationPattern.matcher(line);
            if (durationMatcher.find()) {
                int hours = Integer.parseInt(durationMatcher.group(1));
                int minutes = Integer.parseInt(durationMatcher.group(2));
                int seconds = Integer.parseInt(durationMatcher.group(3));
                int centiseconds = Integer.parseInt(durationMatcher.group(4));
                totalDuration = hours * 3600.0 + minutes * 60.0 + seconds + centiseconds / 100.0;
            }
            
            // 解析当前时间并计算进度
            Matcher timeMatcher = timePattern.matcher(line);
            if (timeMatcher.find() && totalDuration != null) {
                int hours = Integer.parseInt(timeMatcher.group(1));
                int minutes = Integer.parseInt(timeMatcher.group(2));
                int seconds = Integer.parseInt(timeMatcher.group(3));
                double currentTime = hours * 3600.0 + minutes * 60.0 + seconds;
                
                int progress = (int) ((currentTime / totalDuration) * 80.0) + 10;
                progress = Math.min(progress, 95);
                updateProgress(task, progress, "转换中: " + formatTime(currentTime));
            }
        }
    }

    private String formatTime(double seconds) {
        int hours = (int) (seconds / 3600);
        int minutes = (int) ((seconds % 3600) / 60);
        int secs = (int) (seconds % 60);
        return String.format("%02d:%02d:%02d", hours, minutes, secs);
    }

    private String getTargetFormat(AsyncTask task) {
        String taskMessage = task.getMessage();
        if (taskMessage != null && taskMessage.contains("targetFormat")) {
            try {
                int startIndex = taskMessage.indexOf("targetFormat\":\"") + 13;
                int endIndex = taskMessage.indexOf("\"", startIndex);
                if (startIndex > 0 && endIndex > startIndex) {
                    return taskMessage.substring(startIndex, endIndex);
                }
            } catch (Exception e) {
                // 解析失败，使用默认格式
            }
        }
        return "mp4"; // 默认转换为MP4格式
    }

    @Override
    public String getSupportedTaskType() {
        return "video_convert";
    }
}
