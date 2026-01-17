package com.example.nd;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.nd.mapper")
public class NdApplication {

    public static void main(String[] args) {
        SpringApplication.run(NdApplication.class, args);
    }
}