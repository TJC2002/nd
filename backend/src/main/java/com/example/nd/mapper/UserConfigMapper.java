package com.example.nd.mapper;

import com.example.nd.model.UserConfig;

import java.util.List;

public interface UserConfigMapper {
    UserConfig getUserConfigByKey(Long userId, String key);
    List<UserConfig> getUserConfigsByUserId(Long userId);
    void insertUserConfig(UserConfig userConfig);
    void updateUserConfig(UserConfig userConfig);
    void deleteUserConfig(Long userId, String key);
    void deleteUserConfigsByUserId(Long userId);
}
