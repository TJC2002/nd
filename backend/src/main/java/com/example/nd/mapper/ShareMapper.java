package com.example.nd.mapper;

import com.example.nd.model.Share;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ShareMapper {

    @Insert("INSERT INTO shares (user_id, file_id, share_code, share_url, password, expire_time, max_downloads, download_count, view_count, status, created_at, updated_at) " +
            "VALUES (#{userId}, #{fileId}, #{shareCode}, #{shareUrl}, #{password}, #{expireTime}, #{maxDownloads}, 0, 0, 'active', NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertShare(Share share);

    @Select("SELECT * FROM shares WHERE id = #{id}")
    Share getShareById(Long id);

    @Select("SELECT * FROM shares WHERE share_code = #{shareCode}")
    Share getShareByCode(String shareCode);

    @Select("SELECT * FROM shares WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<Share> getSharesByUserId(Long userId);

    @Update("UPDATE shares SET status = 'revoked', updated_at = NOW() WHERE id = #{id}")
    int revokeShare(Long id);

    @Update("UPDATE shares SET status = 'expired', updated_at = NOW() WHERE id = #{id}")
    int expireShare(Long id);

    @Update("UPDATE shares SET download_count = download_count + 1, updated_at = NOW() WHERE id = #{id}")
    int incrementDownloadCount(Long id);

    @Update("UPDATE shares SET view_count = view_count + 1, updated_at = NOW() WHERE id = #{id}")
    int incrementViewCount(Long id);

    @Delete("DELETE FROM shares WHERE id = #{id}")
    int deleteShare(Long id);

    @Select("SELECT * FROM shares WHERE status = 'active' AND (expire_time IS NULL OR expire_time > #{currentTime}) AND (max_downloads IS NULL OR download_count < max_downloads)")
    List<Share> getActiveShares(LocalDateTime currentTime);

    @Select("SELECT * FROM shares WHERE status = 'active' AND expire_time < #{currentTime}")
    List<Share> getExpiredShares(LocalDateTime currentTime);
}
