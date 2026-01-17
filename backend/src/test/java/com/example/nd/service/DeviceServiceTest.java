package com.example.nd.service;

import com.example.nd.mapper.DeviceMapper;
import com.example.nd.model.Device;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeviceService单元测试")
class DeviceServiceTest {

    @Mock
    private DeviceMapper deviceMapper;

    @InjectMocks
    private DeviceServiceImpl deviceService;

    private Device testDevice1;
    private Device testDevice2;

    @BeforeEach
    void setUp() {
        testDevice1 = new Device();
        testDevice1.setId(1L);
        testDevice1.setUserId(1L);
        testDevice1.setDeviceName("iPhone 15");
        testDevice1.setDeviceType("mobile");
        testDevice1.setDeviceIdentifier("device_123");
        testDevice1.setLastLoginIp("192.168.1.1");
        testDevice1.setStatus("online");
        testDevice1.setCreatedAt(LocalDateTime.now());

        testDevice2 = new Device();
        testDevice2.setId(2L);
        testDevice2.setUserId(1L);
        testDevice2.setDeviceName("MacBook Pro");
        testDevice2.setDeviceType("desktop");
        testDevice2.setDeviceIdentifier("device_456");
        testDevice2.setLastLoginIp("192.168.1.2");
        testDevice2.setStatus("offline");
        testDevice2.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("获取用户设备列表 - 成功")
    void getDevicesByUserId_Success() {
        List<Device> expectedDevices = Arrays.asList(testDevice1, testDevice2);
        when(deviceMapper.getDevicesByUserId(1L)).thenReturn(expectedDevices);

        List<Device> result = deviceService.getDevicesByUserId(1L);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDeviceName()).isEqualTo("iPhone 15");
        assertThat(result.get(1).getDeviceName()).isEqualTo("MacBook Pro");
        verify(deviceMapper, times(1)).getDevicesByUserId(1L);
    }

    @Test
    @DisplayName("获取用户设备列表 - 空列表")
    void getDevicesByUserId_Empty() {
        when(deviceMapper.getDevicesByUserId(1L)).thenReturn(Arrays.asList());

        List<Device> result = deviceService.getDevicesByUserId(1L);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(deviceMapper, times(1)).getDevicesByUserId(1L);
    }

    @Test
    @DisplayName("远程下线设备 - 成功")
    void logoutDevice_Success() {
        when(deviceMapper.getDeviceById(1L)).thenReturn(testDevice1);
        when(deviceMapper.updateDeviceStatus(1L, "offline")).thenReturn(1);

        deviceService.logoutDevice(1L, 1L);

        verify(deviceMapper, times(1)).getDeviceById(1L);
        verify(deviceMapper, times(1)).updateDeviceStatus(1L, "offline");
    }

    @Test
    @DisplayName("远程下线设备 - 设备不存在")
    void logoutDevice_DeviceNotFound() {
        when(deviceMapper.getDeviceById(999L)).thenReturn(null);

        assertThatThrownBy(() -> deviceService.logoutDevice(1L, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Device not found");

        verify(deviceMapper, times(1)).getDeviceById(999L);
        verify(deviceMapper, never()).updateDeviceStatus(anyLong(), anyString());
    }

    @Test
    @DisplayName("远程下线设备 - 设备不属于当前用户")
    void logoutDevice_DeviceNotBelongToUser() {
        Device otherUserDevice = new Device();
        otherUserDevice.setId(1L);
        otherUserDevice.setUserId(2L);

        when(deviceMapper.getDeviceById(1L)).thenReturn(otherUserDevice);

        assertThatThrownBy(() -> deviceService.logoutDevice(1L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Device not found");

        verify(deviceMapper, times(1)).getDeviceById(1L);
        verify(deviceMapper, never()).updateDeviceStatus(anyLong(), anyString());
    }
}