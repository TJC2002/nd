package com.example.nd.mapper;

import com.example.nd.model.ShareAccessLog;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ShareAccessLogMapper {

    @Insert("INSERT INTO share_access_logs (share_id, access_time, ip_address, user_agent, action) " +
            "VALUES (#{shareId}, NOW(), #{ipAddress}, #{userAgent}, #{action})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertAccessLog(ShareAccessLog log);

    @Select("SELECT * FROM share_access_logs WHERE share_id = #{shareId} ORDER BY access_time DESC LIMIT #{limit}")
    List<ShareAccessLog> getAccessLogsByShareId(@Param("shareId") Long shareId, @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM share_access_logs WHERE share_id = #{shareId} AND action = 'view'")
    int getViewCountByShareId(Long shareId);

    @Select("SELECT COUNT(*) FROM share_access_logs WHERE share_id = #{shareId} AND action = 'download'")
    int getDownloadCountByShareId(Long shareId);
}
