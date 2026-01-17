package com.example.nd.mapper;

import com.example.nd.model.StorageNode;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface StorageMapper {
    
    StorageNode getNodeById(Long id);
    
    List<StorageNode> getAllNodes();
    
    int insertNode(StorageNode node);
    
    int updateNode(StorageNode node);
    
    int deleteNode(Long nodeId);
    
    int updateNodeStatus(Long nodeId, String status);
}