package com.example.nd.service;

import com.example.nd.mapper.DeviceMapper;
import com.example.nd.model.Device;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeviceServiceImpl implements DeviceService {

    @Autowired
    private DeviceMapper deviceMapper;

    @Override
    public List<Device> getDevicesByUserId(Long userId) {
        return deviceMapper.getDevicesByUserId(userId);
    }

    @Override
    public void logoutDevice(Long userId, Long deviceId) {
        Device device = deviceMapper.getDeviceById(deviceId);
        if (device == null || !device.getUserId().equals(userId)) {
            throw new RuntimeException("Device not found");
        }

        deviceMapper.updateDeviceStatus(deviceId, "offline");
    }
}