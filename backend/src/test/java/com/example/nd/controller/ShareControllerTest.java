package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import com.example.nd.model.ShareLink;
import com.example.nd.model.User;
import com.example.nd.service.FileService;
import com.example.nd.service.ShareService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ShareController集成测试")
class ShareControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @org.springframework.boot.test.mock.mockito.MockBean
    private ShareService shareService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private FileService fileService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.example.nd.mapper.UserMapper userMapper;

    private User testUser;
    private ShareLink testShare;
    private FileInfo testFile;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testFile = new FileInfo();
        testFile.setId(1L);
        testFile.setUserId(1L);
        testFile.setFileName("test.txt");
        testFile.setOriginalName("test.txt");
        testFile.setFileSize(1024L);

        testShare = new ShareLink();
        testShare.setId(1L);
        testShare.setUserId(1L);
        testShare.setFileId(1L);
        testShare.setShareCode("abc12345");
        testShare.setPassword("password");
        testShare.setExpireTime(LocalDateTime.now().plusDays(7));
        testShare.setAccessCount(0L);
        testShare.setIsDeleted(false);
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("获取分享记录 - 成功")
    void getShares_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);
        when(shareService.getSharesByUserId(1L)).thenReturn(List.of(testShare));

        mockMvc.perform(get("/shares"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].shareCode").value("abc12345"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("创建分享链接 - 成功")
    void createShare_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);
        when(shareService.createShare(anyLong(), anyLong(), anyString(), anyLong())).thenReturn(testShare);

        CreateShareRequest request = new CreateShareRequest();
        request.setFileId(1L);
        request.setPassword("password");
        request.setExpireDays(7L);

        mockMvc.perform(post("/shares")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.shareCode").value("abc12345"));
    }

    @Test
    @DisplayName("验证分享链接 - 成功")
    void getShareByCode_Success() throws Exception {
        when(shareService.getShareByCode("abc12345")).thenReturn(testShare);

        mockMvc.perform(get("/shares/abc12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.shareCode").value("abc12345"));
    }

    @Test
    @DisplayName("访问分享链接 - 成功")
    void accessShare_Success() throws Exception {
        when(shareService.getShareByCode("abc12345")).thenReturn(testShare);
        when(shareService.validateShare(any(ShareLink.class), anyString())).thenReturn(true);
        when(fileService.getFileById(1L)).thenReturn(testFile);

        AccessShareRequest request = new AccessShareRequest();
        request.setPassword("password");

        mockMvc.perform(post("/shares/abc12345/access")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.fileName").value("test.txt"));
    }

    @Test
    @DisplayName("访问分享链接 - 密码错误")
    void accessShare_InvalidPassword() throws Exception {
        when(shareService.getShareByCode("abc12345")).thenReturn(testShare);
        when(shareService.validateShare(any(ShareLink.class), anyString())).thenReturn(false);

        AccessShareRequest request = new AccessShareRequest();
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/shares/abc12345/access")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(500));
    }

    @Test
    @DisplayName("撤销分享链接 - 成功")
    void deleteShare_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);
        when(shareService.getShareByCode("1")).thenReturn(testShare);

        mockMvc.perform(delete("/shares/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Share link deleted successfully"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("获取分享统计 - 成功")
    void getShareStats_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);
        when(shareService.getSharesByUserId(1L)).thenReturn(List.of(testShare));

        mockMvc.perform(get("/shares/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalShares").value(1))
                .andExpect(jsonPath("$.data.totalAccessCount").value(0));
    }

    @Test
    @DisplayName("获取分享记录 - 未认证")
    void getShares_Unauthorized() throws Exception {
        mockMvc.perform(get("/shares"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("创建分享链接 - 未认证")
    void createShare_Unauthorized() throws Exception {
        CreateShareRequest request = new CreateShareRequest();
        request.setFileId(1L);

        mockMvc.perform(post("/shares")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}