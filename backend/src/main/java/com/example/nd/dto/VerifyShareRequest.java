package com.example.nd.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyShareRequest {
    @NotBlank(message = "分享码不能为空")
    private String shareCode;

    private String password;

    public String getShareCode() {
        return shareCode;
    }

    public void setShareCode(String shareCode) {
        this.shareCode = shareCode;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
