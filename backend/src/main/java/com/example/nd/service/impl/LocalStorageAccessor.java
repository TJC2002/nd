package com.example.nd.service.impl;

import com.example.nd.service.StorageAccessor;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class LocalStorageAccessor implements StorageAccessor {

    @Override
    public InputStream getFile(String path) throws IOException {
        Path filePath = Paths.get(path);
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + path);
        }
        return new FileInputStream(filePath.toFile());
    }

    @Override
    public void saveFile(String path, InputStream inputStream) throws IOException {
        Path filePath = Paths.get(path);
        Files.createDirectories(filePath.getParent());
        
        try (FileOutputStream outputStream = new FileOutputStream(filePath.toFile())) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
        }
    }

    @Override
    public boolean exists(String path) throws IOException {
        Path filePath = Paths.get(path);
        return Files.exists(filePath);
    }

    @Override
    public long getSize(String path) throws IOException {
        Path filePath = Paths.get(path);
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + path);
        }
        return Files.size(filePath);
    }

    @Override
    public String getStorageType() {
        return "local";
    }
}
