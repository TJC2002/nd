package com.example.nd.enums;

public enum TaskStatus {
    PENDING("pending", "等待中"),
    PROCESSING("processing", "处理中"),
    COMPLETED("completed", "已完成"),
    FAILED("failed", "失败"),
    CANCELLED("cancelled", "已取消"),
    PAUSED("paused", "已暂停");
    
    private final String code;
    private final String description;
    
    TaskStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public static TaskStatus fromCode(String code) {
        for (TaskStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return PENDING;
    }
}
