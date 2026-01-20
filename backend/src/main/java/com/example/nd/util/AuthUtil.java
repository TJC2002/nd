package com.example.nd.util;

import cn.dev33.satoken.stp.StpUtil;
import com.example.nd.exception.AuthenticationException;

public class AuthUtil {
    public static Long getUserId() {
        try {
            return StpUtil.getLoginIdAsLong();
        } catch (Exception e) {
            throw new AuthenticationException("认证失败，请重新登录");
        }
    }

    public static void checkLogin() {
        try {
            StpUtil.checkLogin();
        } catch (Exception e) {
            throw new AuthenticationException("认证失败，请重新登录");
        }
    }
}