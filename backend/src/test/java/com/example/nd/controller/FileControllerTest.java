package com.example.nd.controller;

import com.example.nd.dto.*;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import com.example.nd.model.User;
import com.example.nd.service.FileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("FileController集成测试")
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @org.springframework.boot.test.mock.mockito.MockBean
    private FileService fileService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.example.nd.mapper.UserMapper userMapper;

    private User testUser;
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
        testFile.setMimeType("text/plain");
        testFile.setFileHash("abc123");
        testFile.setStoragePath("/storage/1/abc123.txt");
        testFile.setStorageType("local");
        testFile.setVersion(1L);
        testFile.setIsDeleted(false);
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("获取文件列表 - 成功")
    void getFiles_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);
        when(fileService.getFilesByUserId(1L)).thenReturn(java.util.List.of(testFile));

        mockMvc.perform(get("/files"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].fileName").value("test.txt"));
    }

    @Test
    @DisplayName("上传文件 - 成功")
    void uploadFile_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);
        when(fileService.uploadFile(anyLong(), any(), anyLong())).thenReturn(testFile);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "test content".getBytes()
        );

        mockMvc.perform(multipart("/files/upload")
                        .file(file)
                        .param("parentFolderId", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.fileName").value("test.txt"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("获取文件信息 - 成功")
    void getFileById_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);
        when(fileService.getFileById(1L)).thenReturn(testFile);

        mockMvc.perform(get("/files/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.fileName").value("test.txt"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("移动文件 - 成功")
    void moveFile_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);

        FileMoveRequest request = new FileMoveRequest();
        request.setFileId(1L);
        request.setTargetFolderId(2L);

        mockMvc.perform(put("/files/1/move")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("File moved successfully"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("重命名文件 - 成功")
    void renameFile_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);

        FileRenameRequest request = new FileRenameRequest();
        request.setFileId(1L);
        request.setNewName("newname.txt");

        mockMvc.perform(put("/files/1/rename")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("File renamed successfully"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("删除文件 - 成功")
    void deleteFile_Success() throws Exception {
        when(userMapper.getUserByUsername(anyString())).thenReturn(testUser);

        mockMvc.perform(delete("/files/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("File deleted successfully"));
    }

    @Test
    @DisplayName("获取文件列表 - 未认证")
    void getFiles_Unauthorized() throws Exception {
        mockMvc.perform(get("/files"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("上传文件 - 未认证")
    void uploadFile_Unauthorized() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "test content".getBytes()
        );

        mockMvc.perform(multipart("/files/upload")
                        .file(file))
                .andExpect(status().isUnauthorized());
    }
}