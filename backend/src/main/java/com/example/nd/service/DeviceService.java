package com.example.nd.service;

import com.example.nd.model.Device;

import java.util.List;

public interface DeviceService {
    
    List<Device> getDevicesByUserId(Long userId);
    
    void logoutDevice(Long userId, Long deviceId);
}