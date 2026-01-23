package com.example.nd.service;

import com.example.nd.mapper.UserConfigMapper;
import com.example.nd.model.UserConfig;
import com.example.nd.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserConfigServiceImpl implements UserConfigService {

    @Autowired
    private UserConfigMapper userConfigMapper;

    @Override
    public UserConfig getUserConfigByKey(String key) {
        Long userId = AuthUtil.getUserId();
        return userConfigMapper.getUserConfigByKey(userId, key);
    }

    @Override
    public List<UserConfig> getUserConfigs() {
        Long userId = AuthUtil.getUserId();
        return userConfigMapper.getUserConfigsByUserId(userId);
    }

    @Override
    @Transactional
    public UserConfig setUserConfig(String key, String value, String description) {
        Long userId = AuthUtil.getUserId();
        UserConfig existingConfig = userConfigMapper.getUserConfigByKey(userId, key);
        
        if (existingConfig != null) {
            existingConfig.setValue(value);
            existingConfig.setDescription(description);
            userConfigMapper.updateUserConfig(existingConfig);
            return existingConfig;
        } else {
            UserConfig newConfig = new UserConfig();
            newConfig.setUserId(userId);
            newConfig.setKey(key);
            newConfig.setValue(value);
            newConfig.setDescription(description);
            userConfigMapper.insertUserConfig(newConfig);
            return newConfig;
        }
    }

    @Override
    @Transactional
    public void deleteUserConfig(String key) {
        Long userId = AuthUtil.getUserId();
        userConfigMapper.deleteUserConfig(userId, key);
    }

    @Override
    @Transactional
    public void deleteAllUserConfigs() {
        Long userId = AuthUtil.getUserId();
        userConfigMapper.deleteUserConfigsByUserId(userId);
    }
}
