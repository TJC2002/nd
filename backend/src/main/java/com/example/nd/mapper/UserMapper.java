package com.example.nd.mapper;

import com.example.nd.model.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    
    User getUserByUsername(String username);
    
    User getUserById(Long id);
    
    User getUserByEmail(String email);
    
    int insertUser(User user);
    
    int updateUser(User user);
    
    int updateUserPassword(Long userId, String passwordHash);
    
    int deleteUser(Long userId);
    
    int updateUsedSpace(Long userId, Long usedSpace);
    
    Long getTotalSpace(Long userId);
    
    Long getUsedSpace(Long userId);
}