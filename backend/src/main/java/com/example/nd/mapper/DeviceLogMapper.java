package com.example.nd.mapper;

import com.example.nd.model.DeviceLog;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DeviceLogMapper {
    
    DeviceLog getDeviceLogById(Long id);
    
    List<DeviceLog> getDeviceLogsByUserId(Long userId);
    
    List<DeviceLog> getDeviceLogsByDeviceId(Long deviceId);
    
    int insertDeviceLog(DeviceLog deviceLog);
    
    int updateDeviceLog(DeviceLog deviceLog);
    
    int deleteDeviceLog(Long id);
    
    int deleteDeviceLogsByUserId(Long userId);
    
    int deleteDeviceLogsByDeviceId(Long deviceId);
}