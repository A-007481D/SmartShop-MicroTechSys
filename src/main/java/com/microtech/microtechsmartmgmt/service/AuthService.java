package com.microtech.microtechsmartmgmt.service;


import com.microtech.microtechsmartmgmt.dto.request.LoginRequest;
import com.microtech.microtechsmartmgmt.dto.response.AuthResponse;
import jakarta.servlet.http.HttpSession;

public  interface AuthService {

    AuthResponse login(LoginRequest request, HttpSession session);

    void logout(HttpSession session);
}