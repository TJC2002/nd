package com.example.nd.service;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;

public interface StorageAccessor {
    InputStream getFile(String path) throws IOException;
    void saveFile(String path, InputStream inputStream) throws IOException;
    boolean exists(String path) throws IOException;
    long getSize(String path) throws IOException;
    String getStorageType();
}
