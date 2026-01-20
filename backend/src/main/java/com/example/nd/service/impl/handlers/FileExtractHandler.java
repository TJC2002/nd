package com.example.nd.service.impl.handlers;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.AsyncTask;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class FileExtractHandler extends BaseTaskHandler {

    @Autowired
    private FileMapper fileMapper;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    @Override
    public void handleTask(AsyncTask task) throws Exception {
        File file = fileMapper.getFileById(task.getFileId());
        if (file == null) {
            throw new RuntimeException("File not found");
        }

        FileMetadata metadata = fileMetadataMapper.getFileMetadataById(file.getMetadataId());
        if (metadata == null) {
            throw new RuntimeException("File metadata not found");
        }

        String filePath = metadata.getStoragePath();
        if (!"application/zip".equals(metadata.getMimeType()) && 
            !"application/x-rar-compressed".equals(metadata.getMimeType()) && 
            !"application/x-7z-compressed".equals(metadata.getMimeType()) &&
            !"application/x-tar".equals(metadata.getMimeType())) {
            throw new RuntimeException("Unsupported file type for extraction");
        }

        // 获取解压目标目录
        Path sourcePath = Paths.get(filePath);
        Path targetDir = Paths.get(sourcePath.getParent().toString(), file.getName() + "_extracted");
        
        // 创建目标目录
        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }

        updateProgress(task, 5, "开始解压文件");

        try {
            if ("application/zip".equals(metadata.getMimeType())) {
                extractZip(sourcePath, targetDir, task);
            } else if ("application/x-rar-compressed".equals(metadata.getMimeType())) {
                // RAR解压需要额外库，这里简化处理
                throw new RuntimeException("RAR extraction requires additional libraries");
            } else if ("application/x-7z-compressed".equals(metadata.getMimeType())) {
                // 7Z解压需要额外库，这里简化处理
                throw new RuntimeException("7Z extraction requires additional libraries");
            } else if ("application/x-tar".equals(metadata.getMimeType())) {
                extractTar(sourcePath, targetDir, task);
            }

            updateProgress(task, 100, "文件解压完成");
            
            // 创建解压结果数据
            List<String> extractedFiles = listExtractedFiles(targetDir);
            String resultData = String.join(",", extractedFiles);
            
            completeTask(task, resultData);
        } catch (Exception e) {
            failTask(task, "解压失败: " + e.getMessage());
            throw e;
        }
    }

    private void extractZip(Path zipPath, Path targetDir, AsyncTask task) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(zipPath))) {
            ZipEntry entry;
            int totalEntries = 0;
            List<ZipEntry> entries = new ArrayList<>();
            
            // 先遍历获取总条目数
            while ((entry = zis.getNextEntry()) != null) {
                entries.add(entry);
                totalEntries++;
            }
            
            // 重置流
            zis.close();
            try (ZipInputStream zis2 = new ZipInputStream(Files.newInputStream(zipPath))) {
                int processedEntries = 0;
                ZipEntry currentEntry;
                
                while ((currentEntry = zis2.getNextEntry()) != null) {
                    checkPause();
                    if (isTaskCancelled()) {
                        return;
                    }
                    
                    Path entryPath = targetDir.resolve(currentEntry.getName());
                    
                    // 确保目标路径在目标目录内
                    if (!entryPath.normalize().startsWith(targetDir.normalize())) {
                        throw new IOException("Zip entry is outside target directory: " + currentEntry.getName());
                    }
                    
                    if (currentEntry.isDirectory()) {
                        Files.createDirectories(entryPath);
                    } else {
                        Files.createDirectories(entryPath.getParent());
                        Files.copy(zis2, entryPath);
                    }
                    
                    processedEntries++;
                    int progress = 5 + (int) ((processedEntries * 90.0) / totalEntries);
                    updateProgress(task, progress, "解压中: " + currentEntry.getName());
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Task was interrupted");
        }
    }

    private void extractTar(Path tarPath, Path targetDir, AsyncTask task) throws IOException {
        // TAR解压实现简化，实际项目中应使用Apache Commons Compress
        throw new IOException("TAR extraction requires Apache Commons Compress library");
    }

    private List<String> listExtractedFiles(Path targetDir) throws IOException {
        List<String> files = new ArrayList<>();
        Files.walk(targetDir)
            .filter(path -> !Files.isDirectory(path))
            .forEach(path -> files.add(targetDir.relativize(path).toString()));
        return files;
    }

    @Override
    public String getSupportedTaskType() {
        return "file_extract";
    }
}
