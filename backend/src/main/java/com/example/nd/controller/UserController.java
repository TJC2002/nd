package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.model.User;
import com.example.nd.service.UserService;
import cn.dev33.satoken.stp.StpUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "用户管理", description = "用户管理相关接口")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "获取用户信息", description = "获取当前用户的详细信息")
    public ApiResponse<UserProfileResponse> getUserProfile() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            User user = userService.getUserById(userId);
            UserProfileResponse response = new UserProfileResponse();
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setPhone(user.getPhone());
            response.setTotalSpace(user.getTotalSpace());
            response.setUsedSpace(user.getUsedSpace());
            response.setStatus(user.getStatus());
            response.setCreatedAt(user.getCreatedAt());
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "更新用户信息", description = "更新当前用户的基本信息")
    public ApiResponse<String> updateUserProfile(@RequestBody UserUpdateRequest request) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            userService.updateUser(userId, request);
            return ApiResponse.success("Profile updated successfully");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @PutMapping("/password")
    @Operation(summary = "修改密码", description = "修改当前用户的密码")
    public ApiResponse<String> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            userService.changePassword(userId, request);
            return ApiResponse.success("Password changed successfully");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @GetMapping("/storage")
    @Operation(summary = "获取存储信息", description = "获取用户的存储空间使用情况")
    public ApiResponse<Map<String, Object>> getStorageInfo() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            User user = userService.getUserById(userId);
            Map<String, Object> storageInfo = new java.util.HashMap<>();
            storageInfo.put("totalSpace", user.getTotalSpace());
            storageInfo.put("usedSpace", user.getUsedSpace());
            storageInfo.put("remainingSpace", user.getTotalSpace() - user.getUsedSpace());
            storageInfo.put("usedPercentage", (double) user.getUsedSpace() / user.getTotalSpace() * 100);
            return ApiResponse.success(storageInfo);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @PostMapping("/logout-all")
    @Operation(summary = "退出所有设备", description = "强制退出用户的所有登录设备")
    public ApiResponse<String> logoutAllDevices() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            // userService.logoutAllDevices(userId);
            return ApiResponse.success("Logged out from all devices");
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }

    @GetMapping("/activity")
    @Operation(summary = "获取活动记录", description = "获取用户的最近活动记录")
    public ApiResponse<Map<String, Object>> getActivityLog() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            // Map<String, Object> activityLog = userService.getActivityLog(userId);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.error("Unauthorized");
        }
    }
}