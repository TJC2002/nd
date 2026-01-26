package com.example.nd.controller;

import com.example.nd.dto.ApiResponse;
import com.example.nd.dto.CollectionItemRequest;
import com.example.nd.dto.CollectionRequest;
import com.example.nd.dto.CollectionResponse;
import com.example.nd.dto.CollectionItemResponse;
import com.example.nd.service.CollectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/collections")
@Tag(name = "集合管理", description = "文件集合管理相关接口")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    // Collection APIs
    @PostMapping
    @Operation(summary = "创建集合", description = "创建新的文件集合")
    public ApiResponse<CollectionResponse> createCollection(@RequestBody CollectionRequest request) {
        CollectionResponse response = collectionService.createCollection(request);
        return ApiResponse.success(response);
    }

    @PutMapping("/{collectionId}")
    @Operation(summary = "更新集合", description = "更新集合信息")
    public ApiResponse<CollectionResponse> updateCollection(@PathVariable Long collectionId, @RequestBody CollectionRequest request) {
        CollectionResponse response = collectionService.updateCollection(collectionId, request);
        return ApiResponse.success(response);
    }

    @DeleteMapping("/{collectionId}")
    @Operation(summary = "删除集合", description = "删除指定集合")
    public ApiResponse<String> deleteCollection(@PathVariable Long collectionId) {
        collectionService.deleteCollection(collectionId);
        return ApiResponse.success("Collection deleted successfully");
    }

    @GetMapping("/{collectionId}")
    @Operation(summary = "获取集合详情", description = "获取指定集合的详细信息")
    public ApiResponse<CollectionResponse> getCollectionById(@PathVariable Long collectionId) {
        CollectionResponse response = collectionService.getCollectionById(collectionId);
        return ApiResponse.success(response);
    }

    @GetMapping
    @Operation(summary = "获取集合列表", description = "获取当前用户的所有集合")
    public ApiResponse<List<CollectionResponse>> getCollections() {
        List<CollectionResponse> collections = collectionService.getCollectionsByUserId();
        return ApiResponse.success(collections);
    }

    @GetMapping("/parent/{parentId}")
    @Operation(summary = "获取子集合", description = "获取指定父集合下的子集合")
    public ApiResponse<List<CollectionResponse>> getChildCollections(@PathVariable Long parentId) {
        List<CollectionResponse> collections = collectionService.getCollectionsByParentId(parentId);
        return ApiResponse.success(collections);
    }

    // CollectionItem APIs
    @PostMapping("/{collectionId}/items")
    @Operation(summary = "添加文件到集合", description = "将文件添加到指定集合")
    public ApiResponse<CollectionItemResponse> addItemToCollection(@PathVariable Long collectionId, @RequestBody CollectionItemRequest request) {
        CollectionItemResponse response = collectionService.addItemToCollection(collectionId, request);
        return ApiResponse.success(response);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "更新集合项", description = "更新集合中的文件项")
    public ApiResponse<CollectionItemResponse> updateCollectionItem(@PathVariable Long itemId, @RequestBody CollectionItemRequest request) {
        CollectionItemResponse response = collectionService.updateCollectionItem(itemId, request);
        return ApiResponse.success(response);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "从集合移除项", description = "从集合中移除指定的文件项")
    public ApiResponse<String> removeItemFromCollection(@PathVariable Long itemId) {
        collectionService.removeItemFromCollection(itemId);
        return ApiResponse.success("Item removed successfully");
    }

    @GetMapping("/{collectionId}/items")
    @Operation(summary = "获取集合项", description = "获取指定集合中的所有文件项")
    public ApiResponse<List<CollectionItemResponse>> getCollectionItems(@PathVariable Long collectionId) {
        List<CollectionItemResponse> items = collectionService.getCollectionItems(collectionId);
        return ApiResponse.success(items);
    }

    @PutMapping("/{collectionId}/items/reorder")
    @Operation(summary = "重新排序集合项", description = "重新排序集合中的文件项")
    public ApiResponse<String> reorderCollectionItems(@PathVariable Long collectionId, @RequestBody List<Long> itemIds) {
        collectionService.reorderCollectionItems(collectionId, itemIds);
        return ApiResponse.success("Items reordered successfully");
    }
}
