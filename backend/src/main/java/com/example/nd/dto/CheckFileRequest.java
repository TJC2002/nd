package com.example.nd.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CheckFileRequest {
    private String hash;
    private String name;
    private Long size;
    private String type;
}
