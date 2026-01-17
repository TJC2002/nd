package com.example.nd.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FolderCreateRequest {
    @NotBlank
    private String folderName;
    private Long parentFolderId;
}