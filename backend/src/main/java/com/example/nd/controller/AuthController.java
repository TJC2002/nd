package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.mapper.UserMapper;
import com.example.nd.model.User;
import com.example.nd.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "认证管理", description = "用户认证相关接口")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "用户名密码邮箱手机号注册")
    public ApiResponse<LoginResponse> register(@RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户名密码登录")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "令牌刷新", description = "使用刷新令牌获取新的访问令牌")
    public ApiResponse<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出")
    public ApiResponse<String> logout(@RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ApiResponse.success("Logout successful");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "密码找回", description = "发送密码找回链接")
    public ApiResponse<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("Reset link sent to your email");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "密码重置", description = "重置密码")
    public ApiResponse<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password reset successful");
    }

    @PostMapping("/delete-account")
    @Operation(summary = "账号注销", description = "注销用户账号")
    public ApiResponse<String> deleteAccount(@RequestBody DeleteAccountRequest deleteRequest) {
        // 从Sa-Token获取当前登录用户ID
        Long userId = cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong();
        authService.deleteAccount(userId, deleteRequest);
        return ApiResponse.success("Account deleted successfully");
    }
}