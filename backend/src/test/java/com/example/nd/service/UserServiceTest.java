package com.example.nd.service;

import com.example.nd.dto.ChangePasswordRequest;
import com.example.nd.dto.UserUpdateRequest;
import com.example.nd.mapper.UserMapper;
import com.example.nd.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService单元测试")
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPasswordHash("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17hW");
        testUser.setEmail("test@example.com");
        testUser.setPhone("13800138000");
        testUser.setStatus("active");
    }

    @Test
    @DisplayName("根据ID获取用户 - 成功")
    void getUserById_Success() {
        when(userMapper.getUserById(1L)).thenReturn(testUser);

        User result = userService.getUserById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("testuser");
        verify(userMapper, times(1)).getUserById(1L);
    }

    @Test
    @DisplayName("根据ID获取用户 - 用户不存在")
    void getUserById_NotFound() {
        when(userMapper.getUserById(999L)).thenReturn(null);

        User result = userService.getUserById(999L);

        assertThat(result).isNull();
        verify(userMapper, times(1)).getUserById(999L);
    }

    @Test
    @DisplayName("更新用户信息 - 成功")
    void updateUser_Success() {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setEmail("newemail@example.com");
        request.setPhone("13900139000");

        when(userMapper.getUserById(1L)).thenReturn(testUser);
        when(userMapper.updateUser(any(User.class))).thenReturn(1);

        User result = userService.updateUser(1L, request);

        assertThat(result).isNotNull();
        verify(userMapper, times(2)).getUserById(1L);
        verify(userMapper, times(1)).updateUser(any(User.class));
    }

    @Test
    @DisplayName("更新用户信息 - 用户不存在")
    void updateUser_NotFound() {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setEmail("newemail@example.com");
        request.setPhone("13900139000");

        when(userMapper.getUserById(999L)).thenReturn(null);

        assertThatThrownBy(() -> userService.updateUser(999L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(userMapper, times(1)).getUserById(999L);
        verify(userMapper, never()).updateUser(any(User.class));
    }

    @Test
    @DisplayName("修改密码 - 成功")
    void changePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword");

        when(userMapper.getUserById(1L)).thenReturn(testUser);
        when(passwordEncoder.matches("oldPassword", testUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("$2a$10$encodedPassword");

        userService.changePassword(1L, request);

        verify(userMapper, times(1)).getUserById(1L);
        verify(passwordEncoder, times(1)).matches("oldPassword", testUser.getPasswordHash());
        verify(passwordEncoder, times(1)).encode("newPassword");
        verify(userMapper, times(1)).updateUserPassword(1L, "$2a$10$encodedPassword");
    }

    @Test
    @DisplayName("修改密码 - 当前密码错误")
    void changePassword_WrongCurrentPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword");

        when(userMapper.getUserById(1L)).thenReturn(testUser);
        when(passwordEncoder.matches("wrongPassword", testUser.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword(1L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Current password is incorrect");

        verify(userMapper, times(1)).getUserById(1L);
        verify(passwordEncoder, times(1)).matches("wrongPassword", testUser.getPasswordHash());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userMapper, never()).updateUserPassword(anyLong(), anyString());
    }

    @Test
    @DisplayName("修改密码 - 用户不存在")
    void changePassword_UserNotFound() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword");

        when(userMapper.getUserById(999L)).thenReturn(null);

        assertThatThrownBy(() -> userService.changePassword(999L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(userMapper, times(1)).getUserById(999L);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userMapper, never()).updateUserPassword(anyLong(), anyString());
    }
}