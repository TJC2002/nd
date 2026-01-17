package com.example.nd.controller;

import com.example.nd.dto.ApiResponse;
import com.example.nd.model.Device;
import com.example.nd.service.DeviceService;
import cn.dev33.satoken.stp.StpUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/devices")
@Tag(name = "设备管理", description = "设备管理相关接口")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @GetMapping
    @Operation(summary = "获取设备列表", description = "获取用户的所有登录设备")
    public ApiResponse<List<Device>> getDevices() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<Device> devices = deviceService.getDevicesByUserId(userId);
        return ApiResponse.success(devices);
    }

    @PostMapping("/{deviceId}/logout")
    @Operation(summary = "远程下线设备", description = "强制下线指定设备")
    public ApiResponse<String> logoutDevice(@PathVariable Long deviceId) {
        Long userId = StpUtil.getLoginIdAsLong();
        deviceService.logoutDevice(userId, deviceId);
        return ApiResponse.success("Device logged out successfully");
    }
}