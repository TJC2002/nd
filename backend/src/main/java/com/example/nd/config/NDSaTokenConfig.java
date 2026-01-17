package com.example.nd.config;

import cn.dev33.satoken.SaManager;
import cn.dev33.satoken.config.SaTokenConfig;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 配置类
 */
@Configuration
public class NDSaTokenConfig implements WebMvcConfigurer {

    /**
     * 配置跨域
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .maxAge(3600);
    }

    /**
     * 注册 Sa-Token 拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 拦截器，打开注解式鉴权功能
        registry.addInterceptor(new SaInterceptor())
                // 排除不需要认证的路径
                .excludePathPatterns("/auth/**")
                .excludePathPatterns("/files/**")
                .excludePathPatterns("/shares/**")
                .excludePathPatterns("/swagger-ui/**", "/v3/api-docs/**");
    }

    /**
     * 配置 Sa-Token
     */
    @Configuration
    public static class SaTokenCoreConfig {
        public SaTokenCoreConfig() {
            // Sa-Token 配置已通过注解和默认值设置
            // 如需更多配置，请参考 Sa-Token 官方文档
        }
    }
}