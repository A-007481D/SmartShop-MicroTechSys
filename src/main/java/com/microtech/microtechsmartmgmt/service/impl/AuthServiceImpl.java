package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.dto.request.LoginRequest;
import com.microtech.microtechsmartmgmt.dto.response.AuthResponse;
import com.microtech.microtechsmartmgmt.entity.User;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import com.microtech.microtechsmartmgmt.repository.UserRepository;
import com.microtech.microtechsmartmgmt.security.SessionUtils;
import com.microtech.microtechsmartmgmt.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    @Override
    public AuthResponse login(LoginRequest request, HttpSession session) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (!user.getPassword().equals(request.password())) {
            throw new BusinessException("invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        SessionUtils.setUser(session, user);
        return new AuthResponse(user.getId(), user.getEmail(), user.getRole(), "loging successful");
    }

    @Override
    public void logout(HttpSession session) {
        session.invalidate();
    }
}