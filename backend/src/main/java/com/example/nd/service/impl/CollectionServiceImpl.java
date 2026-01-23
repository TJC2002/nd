package com.example.nd.service.impl;

import com.example.nd.dto.CollectionItemRequest;
import com.example.nd.dto.CollectionRequest;
import com.example.nd.dto.CollectionResponse;
import com.example.nd.dto.CollectionItemResponse;
import com.example.nd.mapper.CollectionMapper;
import com.example.nd.mapper.FileMapper;
import com.example.nd.model.MediaCollection;
import com.example.nd.model.CollectionItem;
import com.example.nd.model.File;
import com.example.nd.service.CollectionService;
import com.example.nd.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollectionServiceImpl implements CollectionService {

    @Autowired
    private CollectionMapper collectionMapper;

    @Autowired
    private FileMapper fileMapper;

    @Override
    public CollectionResponse createCollection(CollectionRequest request) {
        Long userId = AuthUtil.getUserId();
        MediaCollection collection = new MediaCollection();
        collection.setUserId(userId);
        collection.setName(request.getName());
        collection.setType(request.getType());
        collection.setDescription(request.getDescription());
        collection.setAuthor(request.getAuthor());
        collection.setCoverImage(request.getCoverImage());
        collection.setParentId(request.getParentId());
        
        collectionMapper.insertCollection(collection);
        return mapToCollectionResponse(collection);
    }

    @Override
    public CollectionResponse updateCollection(Long collectionId, CollectionRequest request) {
        MediaCollection collection = collectionMapper.getCollectionById(collectionId);
        if (collection == null) {
            throw new RuntimeException("Collection not found");
        }
        
        collection.setName(request.getName());
        collection.setType(request.getType());
        collection.setDescription(request.getDescription());
        collection.setAuthor(request.getAuthor());
        collection.setCoverImage(request.getCoverImage());
        collection.setParentId(request.getParentId());
        
        collectionMapper.updateCollection(collection);
        return mapToCollectionResponse(collection);
    }

    @Override
    @Transactional
    public void deleteCollection(Long collectionId) {
        // Delete collection items first
        collectionMapper.deleteCollectionItemsByCollectionId(collectionId);
        // Delete collection
        collectionMapper.deleteCollection(collectionId);
    }

    @Override
    public CollectionResponse getCollectionById(Long collectionId) {
        MediaCollection collection = collectionMapper.getCollectionById(collectionId);
        if (collection == null) {
            throw new RuntimeException("Collection not found");
        }
        return mapToCollectionResponse(collection);
    }

    @Override
    public List<CollectionResponse> getCollectionsByUserId() {
        Long userId = AuthUtil.getUserId();
        List<MediaCollection> collections = collectionMapper.getCollectionsByUserId(userId);
        return collections.stream()
                .map(this::mapToCollectionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CollectionResponse> getCollectionsByParentId(Long parentId) {
        List<MediaCollection> collections = collectionMapper.getCollectionsByParentId(parentId);
        return collections.stream()
                .map(this::mapToCollectionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CollectionItemResponse addItemToCollection(Long collectionId, CollectionItemRequest request) {
        // Get max order index
        Integer maxOrderIndex = collectionMapper.getMaxOrderIndex(collectionId);
        int orderIndex = (maxOrderIndex != null) ? maxOrderIndex + 1 : 0;
        
        CollectionItem item = new CollectionItem();
        item.setCollectionId(collectionId);
        item.setFileId(request.getFileId());
        item.setOrderIndex(orderIndex);
        item.setItemType(request.getItemType());
        item.setMetadata(request.getMetadata());
        
        collectionMapper.insertCollectionItem(item);
        return mapToCollectionItemResponse(item);
    }

    @Override
    public CollectionItemResponse updateCollectionItem(Long itemId, CollectionItemRequest request) {
        CollectionItem item = collectionMapper.getCollectionItemById(itemId);
        if (item == null) {
            throw new RuntimeException("Collection item not found");
        }
        
        item.setFileId(request.getFileId());
        item.setOrderIndex(request.getOrderIndex());
        item.setItemType(request.getItemType());
        item.setMetadata(request.getMetadata());
        
        collectionMapper.updateCollectionItem(item);
        return mapToCollectionItemResponse(item);
    }

    @Override
    public void removeItemFromCollection(Long itemId) {
        collectionMapper.deleteCollectionItem(itemId);
    }

    @Override
    public List<CollectionItemResponse> getCollectionItems(Long collectionId) {
        List<CollectionItem> items = collectionMapper.getCollectionItemsByCollectionId(collectionId);
        return items.stream()
                .map(this::mapToCollectionItemResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void reorderCollectionItems(Long collectionId, List<Long> itemIds) {
        for (int i = 0; i < itemIds.size(); i++) {
            Long itemId = itemIds.get(i);
            CollectionItem item = collectionMapper.getCollectionItemById(itemId);
            if (item != null && item.getCollectionId().equals(collectionId)) {
                item.setOrderIndex(i);
                collectionMapper.updateCollectionItem(item);
            }
        }
    }

    private CollectionResponse mapToCollectionResponse(MediaCollection collection) {
        CollectionResponse response = new CollectionResponse();
        response.setId(collection.getId());
        response.setName(collection.getName());
        response.setType(collection.getType());
        response.setDescription(collection.getDescription());
        response.setAuthor(collection.getAuthor());
        response.setCoverImage(collection.getCoverImage());
        response.setCreatedAt(collection.getCreatedAt());
        response.setParentId(collection.getParentId());
        
        // Get item count
        List<CollectionItem> items = collectionMapper.getCollectionItemsByCollectionId(collection.getId());
        response.setItemCount(items.size());
        
        return response;
    }

    private CollectionItemResponse mapToCollectionItemResponse(CollectionItem item) {
        CollectionItemResponse response = new CollectionItemResponse();
        response.setId(item.getId());
        response.setCollectionId(item.getCollectionId());
        response.setFileId(item.getFileId());
        response.setOrderIndex(item.getOrderIndex());
        response.setItemType(item.getItemType());
        response.setMetadata(item.getMetadata());
        
        // Get file information
        File file = fileMapper.getFileById(item.getFileId());
        if (file != null) {
            response.setFileName(file.getName());
            response.setFileType(file.getFileType());
            response.setFileSize(file.getSize());
            response.setMimeType(file.getMimeType());
        }
        
        return response;
    }
}
