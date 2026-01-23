package com.example.nd.controller;

import com.example.nd.mapper.FileMetadataMapper;
import com.example.nd.model.FileInfo;
import com.example.nd.model.FileMetadata;
import com.example.nd.service.FileService;
import com.example.nd.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/webdav")
public class WebDavController {

    @Autowired
    private FileService fileService;

    @Autowired
    private FileMetadataMapper fileMetadataMapper;

    private static final DateTimeFormatter WEBDAV_DATE_FORMAT = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z");

    @RequestMapping(method = {RequestMethod.GET, RequestMethod.HEAD, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> handleRequest(HttpServletRequest request, HttpServletResponse response, @RequestBody(required = false) byte[] content) throws IOException {
        String method = request.getMethod();
        
        switch (method) {
            case "GET":
            case "HEAD":
                return handleGetResource(request, response);
            case "PUT":
                return handlePutResource(request, content);
            case "DELETE":
                return handleDeleteResource(request);
            case "MKCOL":
                return handleMakeCollection(request);
            case "COPY":
                return handleCopyResource(request);
            case "MOVE":
                return handleMoveResource(request);
            case "PROPFIND":
                return handlePropFind(request);
            case "OPTIONS":
                return handleOptions(request);
            default:
                return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
        }
    }

    private ResponseEntity<?> handleGetResource(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String path = extractPath(request);
        Long userId = AuthUtil.getUserId();
        
        FileInfo fileInfo = resolvePath(userId, path);
        
        if (fileInfo == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return null;
        }
        
        if (fileInfo.getIsFolder()) {
            response.setStatus(HttpStatus.METHOD_NOT_ALLOWED.value());
            return null;
        }
        
        FileInfo file = fileService.getFileById(fileInfo.getId());
        if (file == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return null;
        }
        
        String storagePath = getStoragePath(file);
        if (storagePath == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return null;
        }
        
        Path filePath = Paths.get(storagePath);
        if (!Files.exists(filePath)) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return null;
        }
        
        response.setContentType("application/octet-stream");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileInfo.getFileName() + "\"");
        response.setHeader(HttpHeaders.LAST_MODIFIED, fileInfo.getUpdatedAt().format(WEBDAV_DATE_FORMAT));
        response.setContentLengthLong(Files.size(filePath));
        
        if (request.getMethod().equals("GET")) {
            Files.copy(filePath, response.getOutputStream());
        }
        
        return null;
    }

    private ResponseEntity<String> handlePutResource(HttpServletRequest request, byte[] content) throws IOException {
        String path = extractPath(request);
        Long userId = AuthUtil.getUserId();
        
        String fileName = getFileName(path);
        Long parentFolderId = getParentFolderId(userId, path);
        
        fileService.uploadFile(userId, new org.springframework.web.multipart.MultipartFile() {
            @Override
            public String getName() {
                return "file";
            }

            @Override
            public String getOriginalFilename() {
                return fileName;
            }

            @Override
            public String getContentType() {
                return "application/octet-stream";
            }

            @Override
            public boolean isEmpty() {
                return content.length == 0;
            }

            @Override
            public long getSize() {
                return content.length;
            }

            @Override
            public byte[] getBytes() {
                return content;
            }

            @Override
            public InputStream getInputStream() {
                return new java.io.ByteArrayInputStream(content);
            }

            @Override
            public void transferTo(java.io.File dest) throws IOException {
                Files.write(dest.toPath(), content);
            }
        }, parentFolderId);
        
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private ResponseEntity<String> handleDeleteResource(HttpServletRequest request) {
        String path = extractPath(request);
        Long userId = AuthUtil.getUserId();
        
        FileInfo fileInfo = resolvePath(userId, path);
        if (fileInfo == null) {
            return ResponseEntity.notFound().build();
        }
        
        fileService.deleteFile(fileInfo.getId());
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> handleMakeCollection(HttpServletRequest request) {
        String path = extractPath(request);
        Long userId = AuthUtil.getUserId();
        
        String folderName = getFileName(path);
        Long parentFolderId = getParentFolderId(userId, path);
        
        fileService.createFolder(userId, folderName, parentFolderId);
        
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private ResponseEntity<String> handleCopyResource(HttpServletRequest request) {
        String sourcePath = extractPath(request);
        Long userId = AuthUtil.getUserId();
        
        FileInfo sourceFile = resolvePath(userId, sourcePath);
        if (sourceFile == null) {
            return ResponseEntity.notFound().build();
        }
        
        String destination = request.getHeader("Destination");
        if (destination == null) {
            return ResponseEntity.badRequest().body("Destination header required");
        }
        
        String destPath = extractDestinationPath(destination);
        String destFileName = getFileName(destPath);
        Long destParentFolderId = getParentFolderId(userId, destPath);
        
        if (sourceFile.getIsFolder()) {
            fileService.createFolder(userId, destFileName, destParentFolderId);
        } else {
            FileInfo source = fileService.getFileById(sourceFile.getId());
            if (source != null) {
                String sourceStoragePath = getStoragePath(source);
                if (sourceStoragePath != null) {
                    try {
                        fileService.uploadFile(userId, new org.springframework.web.multipart.MultipartFile() {
                            @Override
                            public String getName() {
                                return "file";
                            }

                            @Override
                            public String getOriginalFilename() {
                                return destFileName;
                            }

                            @Override
                            public String getContentType() {
                                return "application/octet-stream";
                            }

                            @Override
                            public boolean isEmpty() {
                                return false;
                            }

                            @Override
                            public long getSize() {
                                try {
                                    return Files.size(Paths.get(sourceStoragePath));
                                } catch (IOException e) {
                                    return 0;
                                }
                            }

                            @Override
                            public byte[] getBytes() throws IOException {
                                return Files.readAllBytes(Paths.get(sourceStoragePath));
                            }

                            @Override
                            public InputStream getInputStream() throws IOException {
                                return Files.newInputStream(Paths.get(sourceStoragePath));
                            }

                            @Override
                            public void transferTo(java.io.File dest) throws IOException {
                                Files.copy(Paths.get(sourceStoragePath), dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
                            }
                        }, destParentFolderId);
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error copying file");
                    }
                }
            }
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private ResponseEntity<String> handleMoveResource(HttpServletRequest request) {
        String sourcePath = extractPath(request);
        Long userId = AuthUtil.getUserId();
        
        FileInfo sourceFile = resolvePath(userId, sourcePath);
        if (sourceFile == null) {
            return ResponseEntity.notFound().build();
        }
        
        String destination = request.getHeader("Destination");
        if (destination == null) {
            return ResponseEntity.badRequest().body("Destination header required");
        }
        
        String destPath = extractDestinationPath(destination);
        Long destParentFolderId = getParentFolderId(userId, destPath);
        
        fileService.moveFile(sourceFile.getId(), destParentFolderId);
        
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<String> handlePropFind(HttpServletRequest request) throws IOException {
        String path = extractPath(request);
        Long userId = AuthUtil.getUserId();
        
        FileInfo fileInfo = resolvePath(userId, path);
        if (fileInfo == null) {
            return ResponseEntity.notFound().build();
        }
        
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"utf-8\" ?>");
        xml.append("<D:multistatus xmlns:D=\"DAV:\">");
        
        if (fileInfo.getIsFolder()) {
            List<FileInfo> children = fileService.getFilesByFolderId(fileInfo.getId());
            xml.append(generateResourceXml(request, fileInfo, true));
            for (FileInfo child : children) {
                xml.append(generateResourceXml(request, child, false));
            }
        } else {
            xml.append(generateResourceXml(request, fileInfo, false));
        }
        
        xml.append("</D:multistatus>");
        
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType("application/xml; charset=\"utf-8\""))
                .body(xml.toString());
    }

    private ResponseEntity<String> handleOptions(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Allow", "OPTIONS, GET, HEAD, POST, PUT, DELETE, PROPFIND, MKCOL, COPY, MOVE");
        headers.add("DAV", "1, 2");
        headers.add("MS-Author-Via", "DAV");
        return ResponseEntity.ok().headers(headers).build();
    }

    private String extractPath(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String webDavPath = contextPath + "/webdav";
        
        if (requestUri.startsWith(webDavPath)) {
            String path = requestUri.substring(webDavPath.length());
            return path.isEmpty() ? "/" : path;
        }
        return "/";
    }

    private String extractDestinationPath(String destination) {
        try {
            java.net.URL url = new java.net.URL(destination);
            String path = url.getPath();
            return path.isEmpty() ? "/" : path;
        } catch (Exception e) {
            return destination;
        }
    }

    private String getFileName(String path) {
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        int lastSlash = path.lastIndexOf("/");
        return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    }

    private FileInfo resolvePath(Long userId, String path) {
        if (path.equals("/") || path.isEmpty()) {
            return null;
        }
        
        String[] parts = path.split("/");
        Long currentFolderId = 0L;
        
        for (int i = 1; i < parts.length; i++) {
            String part = parts[i];
            if (part.isEmpty()) continue;
            
            List<FileInfo> files = fileService.getFilesByFolderId(currentFolderId);
            FileInfo found = null;
            for (FileInfo file : files) {
                if (file.getFileName().equals(part)) {
                    found = file;
                    break;
                }
            }
            
            if (found == null) {
                return null;
            }
            
            if (i == parts.length - 1) {
                return found;
            }
            
            if (!found.getIsFolder()) {
                return null;
            }
            
            currentFolderId = found.getId();
        }
        
        return null;
    }

    private Long getParentFolderId(Long userId, String path) {
        if (path.equals("/") || path.isEmpty()) {
            return 0L;
        }
        
        String parentPath = path.substring(0, path.lastIndexOf("/"));
        if (parentPath.isEmpty()) {
            return 0L;
        }
        
        FileInfo parentFolder = resolvePath(userId, parentPath);
        return parentFolder != null ? parentFolder.getId() : 0L;
    }

    private String getStoragePath(FileInfo fileInfo) {
        if (fileInfo.getStoragePath() != null) {
            return fileInfo.getStoragePath();
        }
        return null;
    }

    private String generateResourceXml(HttpServletRequest request, FileInfo file, boolean isCollection) {
        String href = request.getRequestURL().toString();
        if (!href.endsWith("/") && isCollection) {
            href += "/";
        }
        
        StringBuilder xml = new StringBuilder();
        xml.append("<D:response>");
        xml.append("<D:href>").append(href).append("</D:href>");
        xml.append("<D:propstat>");
        xml.append("<D:prop>");
        xml.append("<D:displayname>").append(escapeXml(file.getFileName())).append("</D:displayname>");
        
        if (isCollection || file.getIsFolder()) {
            xml.append("<D:resourcetype><D:collection/></D:resourcetype>");
        } else {
            xml.append("<D:resourcetype/>");
            xml.append("<D:getcontenttype>application/octet-stream</D:getcontenttype>");
            FileInfo fileEntity = fileService.getFileById(file.getId());
            if (fileEntity != null) {
                String storagePath = getStoragePath(fileEntity);
                if (storagePath != null) {
                    try {
                        xml.append("<D:getcontentlength>").append(Files.size(Paths.get(storagePath))).append("</D:getcontentlength>");
                    } catch (IOException e) {
                        xml.append("<D:getcontentlength>0</D:getcontentlength>");
                    }
                }
            }
        }
        
        xml.append("<D:getlastmodified>").append(file.getUpdatedAt().format(WEBDAV_DATE_FORMAT)).append("</D:getlastmodified>");
        xml.append("</D:prop>");
        xml.append("<D:status>HTTP/1.1 200 OK</D:status>");
        xml.append("</D:propstat>");
        xml.append("</D:response>");
        
        return xml.toString();
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }
}
