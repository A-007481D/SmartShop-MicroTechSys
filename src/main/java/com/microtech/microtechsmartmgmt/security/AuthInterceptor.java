package com.microtech.microtechsmartmgmt.security;

import com.microtech.microtechsmartmgmt.entity.User;
import com.microtech.microtechsmartmgmt.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
@Component
public class AuthInterceptor implements HandlerInterceptor{
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if(!(handler instanceof HandlerMethod)){
            return true;

        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        // check for the annotation
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        // no annotation == public
        if(requireRole == null) {
            return true;
        }

        HttpSession session =request.getSession(false);
        if (session == null || !SessionUtils.isLoggedIn(session)) {
            throw new BusinessException("user not authenticated", HttpStatus.UNAUTHORIZED);
        }

        User currentUser = SessionUtils.getUser(session);
        boolean hasAllowedRole = Arrays.stream(requireRole.value())
                .anyMatch(role -> role == currentUser.getRole());

        if(!hasAllowedRole) {
            throw new BusinessException("access denied : insufficient perms", HttpStatus.FORBIDDEN);
        }

        return true;

    }
}
