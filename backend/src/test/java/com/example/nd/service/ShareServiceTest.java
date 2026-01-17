package com.example.nd.service;

import com.example.nd.mapper.FileMapper;
import com.example.nd.mapper.ShareMapper;
import com.example.nd.model.File;
import com.example.nd.model.ShareLink;
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
@DisplayName("ShareService单元测试")
class ShareServiceTest {

    @Mock
    private ShareMapper shareMapper;

    @Mock
    private FileMapper fileMapper;

    @InjectMocks
    private ShareServiceImpl shareService;

    private File testFile;
    private ShareLink testShare;

    @BeforeEach
    void setUp() {
        testFile = new File();
        testFile.setId(1L);
        testFile.setUserId(1L);
        testFile.setFileName("test.txt");
        testFile.setIsDeleted(false);

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
    @DisplayName("创建分享链接 - 成功")
    void createShare_Success() {
        when(fileMapper.getFileById(1L)).thenReturn(testFile);
        when(shareMapper.insertShare(any(ShareLink.class))).thenAnswer(invocation -> {
            ShareLink share = invocation.getArgument(0);
            share.setId(1L);
            return 1;
        });

        ShareLink result = shareService.createShare(1L, 1L, "password", 7L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("password", result.getPassword());
        assertNotNull(result.getExpireTime());
        verify(shareMapper).insertShare(any(ShareLink.class));
    }

    @Test
    @DisplayName("创建分享链接 - 文件不存在")
    void createShare_FileNotFound() {
        when(fileMapper.getFileById(1L)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> shareService.createShare(1L, 1L, "password", 7L));
    }

    @Test
    @DisplayName("创建分享链接 - 无权限")
    void createShare_NoPermission() {
        testFile.setUserId(2L);
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        assertThrows(RuntimeException.class, () -> shareService.createShare(1L, 1L, "password", 7L));
    }

    @Test
    @DisplayName("获取分享链接 - 成功")
    void getShareByCode_Success() {
        when(shareMapper.getShareByCode("abc12345")).thenReturn(testShare);

        ShareLink result = shareService.getShareByCode("abc12345");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("abc12345", result.getShareCode());
    }

    @Test
    @DisplayName("获取分享链接 - 不存在")
    void getShareByCode_NotFound() {
        when(shareMapper.getShareByCode("abc12345")).thenReturn(null);

        ShareLink result = shareService.getShareByCode("abc12345");

        assertNull(result);
    }

    @Test
    @DisplayName("验证分享链接 - 成功（无密码）")
    void validateShare_Success_NoPassword() {
        testShare.setPassword(null);
        when(shareMapper.getShareByCode("abc12345")).thenReturn(testShare);

        boolean result = shareService.validateShare(testShare, null);

        assertTrue(result);
    }

    @Test
    @DisplayName("验证分享链接 - 成功（有密码）")
    void validateShare_Success_WithPassword() {
        when(shareMapper.getShareByCode("abc12345")).thenReturn(testShare);

        boolean result = shareService.validateShare(testShare, "password");

        assertTrue(result);
    }

    @Test
    @DisplayName("验证分享链接 - 密码错误")
    void validateShare_InvalidPassword() {
        when(shareMapper.getShareByCode("abc12345")).thenReturn(testShare);

        boolean result = shareService.validateShare(testShare, "wrongpassword");

        assertFalse(result);
    }

    @Test
    @DisplayName("验证分享链接 - 已删除")
    void validateShare_Deleted() {
        testShare.setIsDeleted(true);
        when(shareMapper.getShareByCode("abc12345")).thenReturn(testShare);

        boolean result = shareService.validateShare(testShare, "password");

        assertFalse(result);
    }

    @Test
    @DisplayName("验证分享链接 - 已过期")
    void validateShare_Expired() {
        testShare.setExpireTime(LocalDateTime.now().minusDays(1));
        when(shareMapper.getShareByCode("abc12345")).thenReturn(testShare);

        boolean result = shareService.validateShare(testShare, "password");

        assertFalse(result);
    }

    @Test
    @DisplayName("获取用户分享列表 - 成功")
    void getSharesByUserId_Success() {
        when(shareMapper.getSharesByUserId(1L)).thenReturn(List.of(testShare));

        List<ShareLink> result = shareService.getSharesByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    @DisplayName("删除分享链接 - 成功")
    void deleteShare_Success() {
        when(shareMapper.getShareByCode("1")).thenReturn(testShare);

        shareService.deleteShare(1L);

        verify(shareMapper).deleteShare(1L);
    }

    @Test
    @DisplayName("增加访问次数 - 成功")
    void incrementAccessCount_Success() {
        shareService.incrementAccessCount(1L);

        verify(shareMapper).incrementAccessCount(1L);
    }

    @Test
    @DisplayName("获取分享文件 - 成功")
    void getSharedFile_Success() {
        when(fileMapper.getFileById(1L)).thenReturn(testFile);

        File result = shareService.getSharedFile(testShare);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test.txt", result.getFileName());
    }
}