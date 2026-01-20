package com.example.nd.enums;

public enum TaskType {
    FILE_EXTRACT("file_extract", "文件解压"),
    VIDEO_CONVERT("video_convert", "视频格式转换"),
    VIDEO_COMPRESS("video_compress", "视频压缩"),
    IMAGE_CONVERT("image_convert", "图片格式转换"),
    IMAGE_COMPRESS("image_compress", "图片压缩"),
    FILE_ENCRYPT("file_encrypt", "文件加密"),
    FILE_DECRYPT("file_decrypt", "文件解密"),
    PDF_GENERATE("pdf_generate", "PDF生成"),
    WATERMARK_ADD("watermark_add", "添加水印"),
    BATCH_PROCESS("batch_process", "批量处理"),
    CUSTOM("custom", "自定义任务");
    
    private final String code;
    private final String description;
    
    TaskType(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public static TaskType fromCode(String code) {
        for (TaskType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return CUSTOM;
    }
}
