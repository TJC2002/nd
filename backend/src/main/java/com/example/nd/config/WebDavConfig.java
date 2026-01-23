package com.example.nd.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebDavConfig implements WebMvcConfigurer {
    
    @Autowired
    private WebDavAuthInterceptor webDavAuthInterceptor;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/webdav/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PROPFIND", "MKCOL", "COPY", "MOVE")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(webDavAuthInterceptor)
                .addPathPatterns("/webdav/**");
    }
}
