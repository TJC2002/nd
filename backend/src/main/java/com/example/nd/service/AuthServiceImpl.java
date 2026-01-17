package com.example.nd.service;

import com.example.nd.dto.*;
import com.example.nd.mapper.DeviceLogMapper;
import com.example.nd.mapper.DeviceMapper;
import com.example.nd.mapper.UserMapper;
import com.example.nd.model.Device;
import com.example.nd.model.DeviceLog;
import com.example.nd.model.User;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import com.example.nd.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private DeviceMapper deviceMapper;

    @Autowired
    private DeviceLogMapper deviceLogMapper;



    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String RESET_TOKEN_PREFIX = "reset_token:";
    private static final Long DEFAULT_TOTAL_SPACE = 2147483648L;

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        if (userMapper.getUserByUsername(request.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }

        if (userMapper.getUserByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(PasswordUtil.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setTotalSpace(DEFAULT_TOTAL_SPACE);
        user.setUsedSpace(0L);
        user.setStatus("active");
        userMapper.insertUser(user);

        // 使用Sa-Token生成token
        StpUtil.login(user.getId());
        String accessToken = StpUtil.getTokenValue();
        String refreshToken = UUID.randomUUID().toString();
        
        // 存储refreshToken到Redis
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + refreshToken,
                user.getId(),
                7,
                TimeUnit.DAYS
        );
        
        return new LoginResponse(accessToken, refreshToken, user.getId(), user.getUsername(), 3600000L);
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 验证用户密码
        User user = userMapper.getUserByUsername(request.getUsername());
        if (user == null || !PasswordUtil.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        // 使用Sa-Token登录
        StpUtil.login(user.getId());
        String accessToken = StpUtil.getTokenValue();
        String refreshToken = UUID.randomUUID().toString();
        
        // 存储refreshToken到Redis
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + refreshToken,
                user.getId(),
                7,
                TimeUnit.DAYS
        );
        
        return new LoginResponse(accessToken, refreshToken, user.getId(), user.getUsername(), 3600000L);
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        Long userId = (Long) redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + refreshToken);
        if (userId == null) {
            throw new RuntimeException("Invalid refresh token");
        }

        // 使用Sa-Token生成新token
        StpUtil.login(userId);
        String newAccessToken = StpUtil.getTokenValue();
        
        return new RefreshTokenResponse(newAccessToken, 3600000L);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        // 删除Redis中的refreshToken
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + refreshToken);
        
        // 使用Sa-Token注销登录
        if (StpUtil.isLogin()) {
            StpUtil.logout();
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userMapper.getUserByEmail(request.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                RESET_TOKEN_PREFIX + resetToken,
                user.getId(),
                1,
                TimeUnit.HOURS
        );
        System.out.println("Password reset token: " + resetToken);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Long userId = (Long) redisTemplate.opsForValue().get(RESET_TOKEN_PREFIX + request.getToken());
        if (userId == null) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        String encodedPassword = PasswordUtil.encode(request.getNewPassword());
        userMapper.updateUserPassword(userId, encodedPassword);
        redisTemplate.delete(RESET_TOKEN_PREFIX + request.getToken());
    }

    @Override
    @Transactional
    public void deleteAccount(Long userId, DeleteAccountRequest request) {
        User user = userMapper.getUserById(userId);
        if (!PasswordUtil.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        deviceMapper.deleteDevicesByUserId(userId);
        deviceLogMapper.deleteDeviceLogsByUserId(userId);
        userMapper.deleteUser(userId);
        
        // 注销登录
        if (StpUtil.isLogin()) {
            StpUtil.logout();
        }
    }
}