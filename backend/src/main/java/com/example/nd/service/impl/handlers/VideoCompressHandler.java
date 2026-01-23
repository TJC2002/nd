package com.example.nd.service.impl.handlers;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.AsyncTask;
import com.example.nd.model.File;
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
public class VideoCompressHandler extends BaseTaskHandler {

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
            throw new RuntimeException("Unsupported file type for video compression");
        }

        updateProgress(task, 5, "开始视频压缩");

        try {
            int targetBitrate = getTargetBitrate(task);
            String targetResolution = getTargetResolution(task);
            
            Path sourcePath = Paths.get(filePath);
            Path targetPath = Paths.get(sourcePath.getParent().toString(), 
                file.getName().substring(0, file.getName().lastIndexOf('.')) + "_compressed." + 
                file.getName().substring(file.getName().lastIndexOf('.') + 1));
            
            // 构建FFmpeg压缩命令
            ProcessBuilder pb = new ProcessBuilder(
                FFMPEG_PATH,
                "-i", sourcePath.toString(),
                "-c:v", "libx264",
                "-b:v", targetBitrate + "k",
                "-s", targetResolution,
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart",
                targetPath.toString()
            );
            
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // 监控压缩进度
            monitorProgress(process, task);
            
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg compression failed with exit code: " + exitCode);
            }
            
            updateProgress(task, 100, "视频压缩完成");
            
            // 创建压缩结果数据
            long originalSize = Files.size(sourcePath);
            long compressedSize = Files.size(targetPath);
            double compressionRatio = (1.0 - (double) compressedSize / originalSize) * 100;
            
            String resultData = String.format(
                "{\"sourceFile\":\"%s\",\"compressedFile\":\"%s\",\"originalSize\":%d,\"compressedSize\":%d,\"compressionRatio\":%.2f,\"bitrate\":%d,\"resolution\":\"%s\"}", 
                filePath, targetPath.toString(), originalSize, compressedSize, compressionRatio, targetBitrate, targetResolution);
            
            completeTask(task, resultData);
        } catch (Exception e) {
            failTask(task, "视频压缩失败: " + e.getMessage());
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
                totalDuration = hours * 3600.0 + minutes * 60.0 + seconds + centiseconds / 1000.0;
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
                updateProgress(task, progress, "压缩中: " + formatTime(currentTime));
            }
        }
    }

    private String formatTime(double seconds) {
        int hours = (int) (seconds / 3600);
        int minutes = (int) ((seconds % 3600) / 60);
        int secs = (int) (seconds % 60);
        return String.format("%02d:%02d:%02d", hours, minutes, secs);
    }

    private int getTargetBitrate(AsyncTask task) {
        String taskMessage = task.getMessage();
        if (taskMessage != null && taskMessage.contains("targetBitrate")) {
            try {
                int startIndex = taskMessage.indexOf("targetBitrate\":") + 15;
                int endIndex = taskMessage.indexOf(",", startIndex);
                if (startIndex > 0 && endIndex > startIndex) {
                    return Integer.parseInt(taskMessage.substring(startIndex, endIndex));
                }
            } catch (Exception e) {
                // 解析失败，使用默认码率
            }
        }
        return 1000; // 默认1000kbps码率
    }

    private String getTargetResolution(AsyncTask task) {
        String taskMessage = task.getMessage();
        if (taskMessage != null && taskMessage.contains("targetResolution")) {
            try {
                int startIndex = taskMessage.indexOf("targetResolution\":\"") + 19;
                int endIndex = taskMessage.indexOf("\"", startIndex);
                if (startIndex > 0 && endIndex > startIndex) {
                    return taskMessage.substring(startIndex, endIndex);
                }
            } catch (Exception e) {
                // 解析失败，使用默认分辨率
            }
        }
        return "1280x720"; // 默认720p分辨率
    }

    @Override
    public String getSupportedTaskType() {
        return "video_compress";
    }
}
