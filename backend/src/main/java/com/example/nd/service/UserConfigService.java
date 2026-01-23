package com.example.nd.service;

import com.example.nd.model.UserConfig;

import java.util.List;

public interface UserConfigService {
    UserConfig getUserConfigByKey(String key);
    List<UserConfig> getUserConfigs();
    UserConfig setUserConfig(String key, String value, String description);
    void deleteUserConfig(String key);
    void deleteAllUserConfigs();
}
