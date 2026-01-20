package com.example.nd.service;

import java.io.IOException;
import java.nio.file.Path;

public interface CoverService {
    
    /**
     * 为文件生成封面
     * @param fileId 文件ID
     * @param filePath 文件存储路径
     * @param mimeType 文件MIME类型
     * @return 封面存储路径
     */
    String generateCover(Long fileId, Path filePath, String mimeType) throws IOException;
    
    /**
     * 获取文件封面
     * @param fileId 文件ID
     * @param size 封面尺寸（可选，如"small", "medium", "large"）
     * @return 封面文件路径
     */
    Path getCover(Long fileId, String size);
    
    /**
     * 检查文件是否已有封面
     * @param fileId 文件ID
     * @return 是否已存在封面
     */
    boolean hasCover(Long fileId);
    
    /**
     * 删除文件封面
     * @param fileId 文件ID
     */
    void deleteCover(Long fileId);
}
