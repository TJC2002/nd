package com.example.nd.config;

import com.example.nd.mapper.UserMapper;
import com.example.nd.model.User;
import com.example.nd.util.PasswordUtil;
import cn.dev33.satoken.stp.StpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class WebDavAuthInterceptor implements HandlerInterceptor {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            response.setHeader("WWW-Authenticate", "Basic realm=\"WebDAV\"");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return false;
        }
        
        String base64Credentials = authHeader.substring("Basic ".length());
        String credentials = new String(java.util.Base64.getDecoder().decode(base64Credentials));
        String[] values = credentials.split(":", 2);
        
        if (values.length != 2) {
            response.setHeader("WWW-Authenticate", "Basic realm=\"WebDAV\"");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid credentials");
            return false;
        }
        
        String username = values[0];
        String password = values[1];
        
        User user = userMapper.getUserByUsername(username);
        if (user == null || !PasswordUtil.matches(password, user.getPasswordHash())) {
            response.setHeader("WWW-Authenticate", "Basic realm=\"WebDAV\"");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid username or password");
            return false;
        }
        
        StpUtil.login(user.getId());
        return true;
    }
}
