package com.example.nd.mapper;

import com.example.nd.model.ShareLink;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ShareLinkMapper {

    ShareLink getShareById(Long id);

    ShareLink getShareByCode(String shareCode);

    List<ShareLink> getSharesByUserId(Long userId);

    int insertShare(ShareLink share);

    int updateShare(ShareLink share);

    int deleteShare(Long shareId);

    int incrementAccessCount(Long shareId);
}
