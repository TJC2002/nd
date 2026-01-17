package com.example.nd.service;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.UserMapper;
import com.example.nd.model.File;
import com.example.nd.model.FileInfo;
import com.example.nd.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@ActiveProfiles("test")
@DisplayName("FileService单元测试")
class FileServiceTest {

    @Mock
    private FileMapper fileMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private FileServiceImpl fileService;

    private User testUser;
    private File testFile;
    private MultipartFile mockFile;

    @BeforeEach
    void setUp() throws IOException {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setTotalSpace(2147483648L);
        testUser.setUsedSpace(0L);
        testUser.setStatus("active");

        testFile = new File();
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
        testFile.setCreatedAt(LocalDateTime.now());
        testFile.setUpdatedAt(LocalDateTime.now());

        mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn("test.txt");
        when(mockFile.getContentType()).thenReturn("text/plain");
        when(mockFile.getSize()).thenReturn(1024L);
        when(mockFile.getBytes()).thenReturn("test content".getBytes());
    }

    @Test
    @DisplayName("上传文件 - 成功")
    void uploadFile_Success() throws IOException {
        when(userMapper.getUserById(1L)).thenReturn(testUser);
        when(fileMapper.insertFile(any(File.class))).thenAnswer(invocation -> {
            File file = invocation.getArgument(0);
            file.setId(1L);
            return 1;
        });
        when(storageService.selectStorageNode(any(File.class))).thenReturn("local");

        FileInfo result = fileService.uploadFile(1L, mockFile, null);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test.txt", result.getFileName());
        assertEquals("local", result.getStorageType());
    }

    @Test
    @DisplayName("上传文件 - 用户不存在")
    void uploadFile_UserNotFound() throws IOException {
        when(userMapper.getUserById(1L)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> fileService.uploadFile(1L, mockFile, null));
    }

    @Test
    @DisplayName("获取文件 - 成功")
    void getFileById_Success() {
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        FileInfo result = fileService.getFileById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test.txt", result.getFileName());
    }

    @Test
    @DisplayName("获取文件 - 文件不存在")
    void getFileById_NotFound() {
        when(fileMapper.getFileById(1L)).thenReturn(null);

        FileInfo result = fileService.getFileById(1L);

        assertNull(result);
    }

    @Test
    @DisplayName("获取用户文件列表 - 成功")
    void getFilesByUserId_Success() {
        when(fileMapper.getFilesByUserId(1L)).thenReturn(List.of(testFile));

        List<FileInfo> result = fileService.getFilesByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("test.txt", result.get(0).getFileName());
    }

    @Test
    @DisplayName("删除文件 - 成功")
    void deleteFile_Success() {
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        fileService.deleteFile(1L);

        verify(fileMapper).deleteFile(1L);
    }

    @Test
    @DisplayName("删除文件 - 文件不存在")
    void deleteFile_NotFound() {
        when(fileMapper.getFileById(1L)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> fileService.deleteFile(1L));
    }

    @Test
    @DisplayName("移动文件 - 成功")
    void moveFile_Success() {
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        fileService.moveFile(1L, 2L);

        verify(fileMapper).updateFile(any(File.class));
    }

    @Test
    @DisplayName("重命名文件 - 成功")
    void renameFile_Success() {
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        fileService.renameFile(1L, "newname.txt");

        verify(fileMapper).updateFile(any(File.class));
    }

    @Test
    @DisplayName("下载文件 - 成功")
    void downloadFile_Success() {
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        FileInfo result = fileService.downloadFile(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("下载文件 - 文件已删除")
    void downloadFile_FileDeleted() {
        testFile.setIsDeleted(true);
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        assertThrows(RuntimeException.class, () -> fileService.downloadFile(1L));
    }
}