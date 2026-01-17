package com.example.nd.service;

import com.example.nd.dto.*;
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
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("AuthService单元测试")
class AuthServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPasswordHash("encodedPassword");
        testUser.setEmail("test@example.com");
        testUser.setPhone("13800138000");
        testUser.setTotalSpace(2147483648L);
        testUser.setUsedSpace(0L);
        testUser.setStatus("active");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("password123");
        registerRequest.setConfirmPassword("password123");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPhone("13800138000");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
    }

    @Test
    @DisplayName("用户注册 - 成功")
    void register_Success() {
        when(userMapper.getUserByUsername("testuser")).thenReturn(null);
        when(userMapper.getUserByEmail("test@example.com")).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userMapper.insertUser(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return 1;
        });

        LoginResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals(1L, response.getUserId());
        assertEquals("testuser", response.getUsername());
        assertEquals(3600000L, response.getExpiresIn());

        verify(userMapper).insertUser(any(User.class));
    }

    @Test
    @DisplayName("用户注册 - 密码不匹配")
    void register_PasswordMismatch() {
        registerRequest.setConfirmPassword("different");

        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
    }

    @Test
    @DisplayName("用户注册 - 用户名已存在")
    void register_UsernameExists() {
        when(userMapper.getUserByUsername("testuser")).thenReturn(testUser);

        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
    }

    @Test
    @DisplayName("用户注册 - 邮箱已存在")
    void register_EmailExists() {
        when(userMapper.getUserByUsername("testuser")).thenReturn(null);
        when(userMapper.getUserByEmail("test@example.com")).thenReturn(testUser);

        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
    }

    @Test
    @DisplayName("用户登录 - 成功")
    void login_Success() {
        when(userMapper.getUserByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    @DisplayName("用户登录 - 密码错误")
    void login_InvalidPassword() {
        when(userMapper.getUserByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("用户登录 - 用户不存在")
    void login_UserNotFound() {
        when(userMapper.getUserByUsername("testuser")).thenReturn(null);

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }
}