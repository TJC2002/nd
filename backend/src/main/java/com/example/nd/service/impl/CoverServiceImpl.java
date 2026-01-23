package com.example.nd.service.impl;

import com.example.nd.service.CoverService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class CoverServiceImpl implements CoverService {

    @Value("${app.storage.covers-path:./storage/covers}")
    private String coverBasePath;

    private static final int SMALL_SIZE = 128;
    private static final int MEDIUM_SIZE = 256;
    private static final int LARGE_SIZE = 512;

    @Override
    public String generateCover(Long fileId, Path filePath, String mimeType) throws IOException {
        // 确保封面存储目录存在
        Path coverDir = Paths.get(coverBasePath);
        if (!Files.exists(coverDir)) {
            Files.createDirectories(coverDir);
        }

        String coverPath = coverBasePath + "/" + fileId + "_cover.jpg";
        Path coverFilePath = Paths.get(coverPath);

        try {
            if (mimeType.startsWith("image/")) {
                // 处理图片文件
                generateImageCover(filePath, coverFilePath);
            } else if (mimeType.startsWith("video/")) {
                // 处理视频文件
                generateVideoCover(filePath, coverFilePath);
            } else if (mimeType.startsWith("application/pdf") || 
                       mimeType.startsWith("application/msword") || 
                       mimeType.startsWith("application/vnd.openxmlformats-officedocument")) {
                // 处理文档文件
                generateDocumentCover(filePath, coverFilePath, mimeType);
            } else {
                // 其他文件类型使用默认封面
                generateDefaultCover(coverFilePath, mimeType);
            }
        } catch (Exception e) {
            // 如果生成失败，使用默认封面
            generateDefaultCover(coverFilePath, mimeType);
        }

        return coverPath;
    }

    @Override
    public Path getCover(Long fileId, String size) {
        Path coverPath = Paths.get(coverBasePath + "/" + fileId + "_cover.jpg");
        
        if (Files.exists(coverPath)) {
            return coverPath;
        }
        
        // 如果没有封面，返回默认封面
        return Paths.get(coverBasePath + "/" + "default_cover.jpg");
    }

    @Override
    public boolean hasCover(Long fileId) {
        Path coverPath = Paths.get(coverBasePath + "/" + fileId + "_cover.jpg");
        return Files.exists(coverPath);
    }

    @Override
    public void deleteCover(Long fileId) {
        Path coverPath = Paths.get(coverBasePath + "/" + fileId + "_cover.jpg");
        try {
            if (Files.exists(coverPath)) {
                Files.delete(coverPath);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void generateImageCover(Path imagePath, Path coverPath) throws IOException {
        BufferedImage image = ImageIO.read(imagePath.toFile());
        BufferedImage cover = resizeImage(image, MEDIUM_SIZE);
        ImageIO.write(cover, "jpg", coverPath.toFile());
    }

    private void generateVideoCover(Path videoPath, Path coverPath) throws IOException {
        // 使用FFmpeg提取视频第一帧作为封面
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", videoPath.toString(),
                "-ss", "00:00:01", // 提取第1秒的帧
                "-vframes", "1", // 只提取1帧
                "-vf", "scale=256:-1", // 缩放到256像素宽
                "-q:v", "2", // 图片质量
                coverPath.toString()
            );
            
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            if (exitCode == 0 && Files.exists(coverPath)) {
                return; // 成功提取封面
            }
            
            // 如果FFmpeg失败，使用默认封面
            System.err.println("FFmpeg thumbnail extraction failed with exit code: " + exitCode);
        } catch (Exception e) {
            System.err.println("Failed to extract video thumbnail: " + e.getMessage());
        }
        
        // 如果FFmpeg提取失败，使用默认封面
        generateDefaultCover(coverPath, "video/*");
    }

    private void generateDocumentCover(Path documentPath, Path coverPath, String mimeType) throws IOException {
        // 简单实现：使用默认文档封面
        // 实际项目中可以使用PDFBox等库生成文档预览
        generateDefaultCover(coverPath, mimeType);
    }

    private void generateDefaultCover(Path coverPath, String mimeType) throws IOException {
        // 创建一个简单的默认封面
        BufferedImage cover = new BufferedImage(MEDIUM_SIZE, MEDIUM_SIZE, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = cover.createGraphics();
        
        // 设置背景色
        if (mimeType.startsWith("image/")) {
            g2d.setColor(Color.LIGHT_GRAY);
        } else if (mimeType.startsWith("video/")) {
            g2d.setColor(Color.DARK_GRAY);
        } else if (mimeType.startsWith("application/pdf")) {
            g2d.setColor(Color.WHITE);
        } else if (mimeType.startsWith("application/msword") || 
                   mimeType.startsWith("application/vnd.openxmlformats-officedocument")) {
            g2d.setColor(Color.WHITE);
        } else {
            g2d.setColor(Color.GRAY);
        }
        
        g2d.fillRect(0, 0, MEDIUM_SIZE, MEDIUM_SIZE);
        
        // 添加简单的图标或文字
        g2d.setColor(Color.BLACK);
        g2d.setFont(new Font("Arial", Font.BOLD, 24));
        String iconText = getFileIconText(mimeType);
        FontMetrics metrics = g2d.getFontMetrics();
        int x = (MEDIUM_SIZE - metrics.stringWidth(iconText)) / 2;
        int y = (MEDIUM_SIZE - metrics.getHeight()) / 2 + metrics.getAscent();
        g2d.drawString(iconText, x, y);
        
        g2d.dispose();
        ImageIO.write(cover, "jpg", coverPath.toFile());
    }

    private BufferedImage resizeImage(BufferedImage original, int targetSize) {
        int width = original.getWidth();
        int height = original.getHeight();
        
        int newWidth, newHeight;
        if (width > height) {
            newWidth = targetSize;
            newHeight = (int) (height * (double) targetSize / width);
        } else {
            newHeight = targetSize;
            newWidth = (int) (width * (double) targetSize / height);
        }
        
        BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.drawImage(original, 0, 0, newWidth, newHeight, null);
        g2d.dispose();
        
        return resized;
    }

    private String getFileIconText(String mimeType) {
        if (mimeType.startsWith("image/")) {
            return "IMG";
        } else if (mimeType.startsWith("video/")) {
            return "VID";
        } else if (mimeType.startsWith("application/pdf")) {
            return "PDF";
        } else if (mimeType.startsWith("application/msword") || 
                   mimeType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            return "DOC";
        } else if (mimeType.startsWith("application/vnd.ms-excel") || 
                   mimeType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            return "XLS";
        } else if (mimeType.startsWith("application/vnd.ms-powerpoint") || 
                   mimeType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation")) {
            return "PPT";
        } else if (mimeType.startsWith("text/")) {
            return "TXT";
        } else if (mimeType.startsWith("audio/")) {
            return "AUD";
        } else {
            return "FILE";
        }
    }
}
