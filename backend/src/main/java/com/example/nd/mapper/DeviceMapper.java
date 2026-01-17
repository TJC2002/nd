package com.example.nd.mapper;

import com.example.nd.model.Device;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DeviceMapper {
    
    Device getDeviceById(Long id);
    
    Device getDeviceByIdentifier(String deviceIdentifier);
    
    List<Device> getDevicesByUserId(Long userId);
    
    int insertDevice(Device device);
    
    int updateDevice(Device device);
    
    int updateDeviceStatus(Long deviceId, String status);
    
    int updateDeviceLoginInfo(Long deviceId, String lastLoginIp);
    
    int deleteDevice(Long deviceId);
    
    int deleteDevicesByUserId(Long userId);
}