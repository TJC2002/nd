package com.example.nd.service;

import com.example.nd.dto.*;

public interface AuthService {
    
    LoginResponse register(RegisterRequest request);
    
    LoginResponse login(LoginRequest request);
    
    RefreshTokenResponse refreshToken(RefreshTokenRequest request);
    
    void logout(String refreshToken);
    
    void forgotPassword(ForgotPasswordRequest request);
    
    void resetPassword(ResetPasswordRequest request);
    
    void deleteAccount(Long userId, DeleteAccountRequest request);
}