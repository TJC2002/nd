package com.example.nd.service;

import com.example.nd.dto.ChangePasswordRequest;
import com.example.nd.dto.UserUpdateRequest;
import com.example.nd.mapper.UserMapper;
import com.example.nd.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.nd.util.PasswordUtil;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;



    @Override
    public User getUserById(Long userId) {
        return userMapper.getUserById(userId);
    }

    @Override
    public User updateUser(Long userId, UserUpdateRequest request) {
        User user = userMapper.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userMapper.updateUser(user);

        return userMapper.getUserById(userId);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userMapper.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (!PasswordUtil.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        String encodedPassword = PasswordUtil.encode(request.getNewPassword());
        userMapper.updateUserPassword(userId, encodedPassword);
    }
}