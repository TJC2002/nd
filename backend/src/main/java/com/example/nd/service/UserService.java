package com.example.nd.service;

import com.example.nd.dto.ChangePasswordRequest;
import com.example.nd.dto.UserUpdateRequest;
import com.example.nd.model.User;

public interface UserService {
    
    User getUserById(Long userId);
    
    User updateUser(Long userId, UserUpdateRequest request);
    
    void changePassword(Long userId, ChangePasswordRequest request);
}