package com.example.nd.controller;

import com.example.nd.dto.ApiResponse;
import com.example.nd.dto.UserConfigRequest;
import com.example.nd.model.UserConfig;
import com.example.nd.service.UserConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-configs")
@Tag(name = "用户配置管理", description = "用户个性化配置相关接口")
public class UserConfigController {

    @Autowired
    private UserConfigService userConfigService;

    @GetMapping
    @Operation(summary = "获取用户配置列表", description = "获取当前用户的所有配置")
    public ApiResponse<List<UserConfig>> getUserConfigs() {
        List<UserConfig> configs = userConfigService.getUserConfigs();
        return ApiResponse.success(configs);
    }

    @GetMapping("/{key}")
    @Operation(summary = "获取指定配置", description = "根据配置键获取用户配置")
    public ApiResponse<UserConfig> getUserConfig(
            @Parameter(description = "配置键") @PathVariable String key) {
        UserConfig config = userConfigService.getUserConfigByKey(key);
        return ApiResponse.success(config);
    }

    @PostMapping
    @Operation(summary = "设置用户配置", description = "设置或更新用户配置")
    public ApiResponse<UserConfig> setUserConfig(
            @RequestBody UserConfigRequest request) {
        UserConfig config = userConfigService.setUserConfig(
                request.getKey(),
                request.getValue(),
                request.getDescription()
        );
        return ApiResponse.success(config);
    }

    @DeleteMapping("/{key}")
    @Operation(summary = "删除用户配置", description = "根据配置键删除用户配置")
    public ApiResponse<String> deleteUserConfig(
            @Parameter(description = "配置键") @PathVariable String key) {
        userConfigService.deleteUserConfig(key);
        return ApiResponse.success("User config deleted successfully");
    }

    @DeleteMapping
    @Operation(summary = "删除所有用户配置", description = "删除当前用户的所有配置")
    public ApiResponse<String> deleteAllUserConfigs() {
        userConfigService.deleteAllUserConfigs();
        return ApiResponse.success("All user configs deleted successfully");
    }
}
