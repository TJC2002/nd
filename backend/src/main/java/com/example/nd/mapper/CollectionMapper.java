package com.example.nd.mapper;

import com.example.nd.model.MediaCollection;
import com.example.nd.model.CollectionItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CollectionMapper {
    // Collection methods
    void insertCollection(MediaCollection collection);
    void updateCollection(MediaCollection collection);
    void deleteCollection(@Param("id") Long id);
    MediaCollection getCollectionById(@Param("id") Long id);
    List<MediaCollection> getCollectionsByUserId(@Param("userId") Long userId);
    List<MediaCollection> getCollectionsByParentId(@Param("parentId") Long parentId);
    
    // CollectionItem methods
    void insertCollectionItem(CollectionItem item);
    void updateCollectionItem(CollectionItem item);
    void deleteCollectionItem(@Param("id") Long id);
    void deleteCollectionItemsByCollectionId(@Param("collectionId") Long collectionId);
    CollectionItem getCollectionItemById(@Param("id") Long id);
    List<CollectionItem> getCollectionItemsByCollectionId(@Param("collectionId") Long collectionId);
    Integer getMaxOrderIndex(@Param("collectionId") Long collectionId);
}
