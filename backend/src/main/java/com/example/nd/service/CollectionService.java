package com.example.nd.service;

import com.example.nd.dto.CollectionItemRequest;
import com.example.nd.dto.CollectionRequest;
import com.example.nd.dto.CollectionResponse;
import com.example.nd.dto.CollectionItemResponse;

import java.util.List;

public interface CollectionService {
    // Collection methods
    CollectionResponse createCollection(CollectionRequest request);
    CollectionResponse updateCollection(Long collectionId, CollectionRequest request);
    void deleteCollection(Long collectionId);
    CollectionResponse getCollectionById(Long collectionId);
    List<CollectionResponse> getCollectionsByUserId();
    List<CollectionResponse> getCollectionsByParentId(Long parentId);
    
    // CollectionItem methods
    CollectionItemResponse addItemToCollection(Long collectionId, CollectionItemRequest request);
    CollectionItemResponse updateCollectionItem(Long itemId, CollectionItemRequest request);
    void removeItemFromCollection(Long itemId);
    List<CollectionItemResponse> getCollectionItems(Long collectionId);
    void reorderCollectionItems(Long collectionId, List<Long> itemIds);
}
