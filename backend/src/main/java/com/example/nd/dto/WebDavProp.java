package com.example.nd.dto;

import lombok.Data;

@Data
public class WebDavProp {
    private String displayName;
    private String getContentType;
    private Long getContentLength;
    private String getLastModified;
    private String getETag;
    private String resourceType;
}
