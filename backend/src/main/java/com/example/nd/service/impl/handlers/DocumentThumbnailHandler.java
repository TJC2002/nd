package com.example.nd.service.impl.handlers;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.AsyncTask;
import com.example.nd.model.File;
import com.example.nd.model.FileMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.imageio.ImageIO;

@Service
public class DocumentThumbnailHandler extends BaseTaskHandler {

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
        String mimeType = metadata.getMimeType();

        updateProgress(task, 5, "开始生成文档封面");

        try {
            Path sourcePath = Paths.get(filePath);
            String thumbnailPath = metadata.getCoverPath();
            
            if (thumbnailPath == null || thumbnailPath.isEmpty()) {
                thumbnailPath = Paths.get(sourcePath.getParent().toString(), 
                    file.getName().substring(0, file.getName().lastIndexOf('.')) + "_thumbnail.jpg").toString();
            }
            
            Path thumbnailFilePath = Paths.get(thumbnailPath);
            
            // 根据文件类型生成封面
            if ("application/pdf".equals(mimeType)) {
                generatePDFThumbnail(sourcePath, thumbnailFilePath, task);
            } else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(mimeType) ||
                       "application/msword".equals(mimeType)) {
                generateWordThumbnail(sourcePath, thumbnailFilePath, task);
            } else if ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(mimeType) ||
                       "application/vnd.ms-excel".equals(mimeType)) {
                generateExcelThumbnail(sourcePath, thumbnailFilePath, task);
            } else if ("application/vnd.openxmlformats-officedocument.presentationml.presentation".equals(mimeType) ||
                       "application/vnd.ms-powerpoint".equals(mimeType)) {
                generatePowerPointThumbnail(sourcePath, thumbnailFilePath, task);
            } else {
                // 其他文档类型使用默认封面
                generateDefaultDocumentThumbnail(mimeType, thumbnailFilePath, task);
            }
            
            updateProgress(task, 100, "文档封面生成完成");
            
            // 更新文件元数据的封面路径
            metadata.setCoverPath(thumbnailPath);
            fileMetadataMapper.updateFileMetadata(metadata);
            
            // 创建封面生成结果数据
            long thumbnailSize = Files.size(thumbnailFilePath);
            String resultData = String.format(
                "{\"documentFile\":\"%s\",\"thumbnailFile\":\"%s\",\"thumbnailSize\":%d}", 
                filePath, thumbnailPath, thumbnailSize);
            
            completeTask(task, resultData);
        } catch (Exception e) {
            failTask(task, "文档封面生成失败: " + e.getMessage());
            throw e;
        }
    }

    private void generatePDFThumbnail(Path pdfPath, Path thumbnailPath, AsyncTask task) throws Exception {
        updateProgress(task, 20, "解析PDF文档");
        checkPause();
        
        // 简化处理，实际项目中应使用PDFBox
        updateProgress(task, 60, "生成PDF预览");
        checkPause();
        
        // 创建默认PDF封面
        createDocumentThumbnail("PDF", thumbnailPath);
    }

    private void generateWordThumbnail(Path docPath, Path thumbnailPath, AsyncTask task) throws Exception {
        updateProgress(task, 20, "加载Word文档");
        checkPause();
        
        // 简化处理，实际项目中应使用Apache POI
        updateProgress(task, 60, "提取文档信息");
        checkPause();
        
        // 创建默认Word封面
        createDocumentThumbnail("DOC", thumbnailPath);
    }

    private void generateExcelThumbnail(Path excelPath, Path thumbnailPath, AsyncTask task) throws Exception {
        updateProgress(task, 20, "加载Excel文档");
        checkPause();
        
        // 简化处理，实际项目中应使用Apache POI
        updateProgress(task, 60, "提取工作表信息");
        checkPause();
        
        // 创建默认Excel封面
        createDocumentThumbnail("XLS", thumbnailPath);
    }

    private void generatePowerPointThumbnail(Path pptPath, Path thumbnailPath, AsyncTask task) throws Exception {
        updateProgress(task, 20, "加载PowerPoint文档");
        checkPause();
        
        // 简化处理，实际项目中应使用Apache POI
        updateProgress(task, 60, "提取幻灯片信息");
        checkPause();
        
        // 创建默认PowerPoint封面
        createDocumentThumbnail("PPT", thumbnailPath);
    }

    private void generateDefaultDocumentThumbnail(String mimeType, Path thumbnailPath, AsyncTask task) throws Exception {
        updateProgress(task, 20, "生成默认文档封面");
        checkPause();
        
        // 根据MIME类型确定文档类型
        String docType = "DOC";
        if (mimeType.contains("pdf")) {
            docType = "PDF";
        } else if (mimeType.contains("excel") || mimeType.contains("spreadsheet")) {
            docType = "XLS";
        } else if (mimeType.contains("powerpoint") || mimeType.contains("presentation")) {
            docType = "PPT";
        }
        
        createDocumentThumbnail(docType, thumbnailPath);
    }

    private void createDocumentThumbnail(String docType, Path thumbnailPath) throws Exception {
        // 创建文档封面图片
        BufferedImage image = new BufferedImage(256, 256, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();
        
        // 设置背景色
        g2d.setColor(new Color(240, 240, 240));
        g2d.fillRect(0, 0, 256, 256);
        
        // 设置边框
        g2d.setColor(new Color(200, 200, 200));
        g2d.setStroke(new BasicStroke(2));
        g2d.drawRect(5, 5, 246, 246);
        
        // 设置文档类型文字
        g2d.setColor(new Color(100, 100, 100));
        g2d.setFont(new Font("Arial", Font.BOLD, 32));
        FontMetrics metrics = g2d.getFontMetrics();
        int x = (256 - metrics.stringWidth(docType)) / 2;
        int y = (256 - metrics.getHeight()) / 2 + metrics.getAscent() / 2;
        g2d.drawString(docType, x, y);
        
        // 设置副标题
        g2d.setFont(new Font("Arial", Font.PLAIN, 14));
        g2d.setColor(new Color(150, 150, 150));
        String subtitle = "Document File";
        metrics = g2d.getFontMetrics();
        x = (256 - metrics.stringWidth(subtitle)) / 2;
        y += 40;
        g2d.drawString(subtitle, x, y);
        
        g2d.dispose();
        
        // 保存为JPEG
        ImageIO.write(image, "jpg", thumbnailPath.toFile());
    }

    @Override
    public String getSupportedTaskType() {
        return "document_thumbnail";
    }
}
