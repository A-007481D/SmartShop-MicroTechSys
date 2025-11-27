package com.microtech.microtechsmartmgmt.security;

import com.microtech.microtechsmartmgmt.entity.User;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import jakarta.servlet.http.HttpSession;

public class SessionUtils {
    public static final String SESSION_USER_KEY = "CURRENT_USER";

    public static void setUser(HttpSession session, User user) {
        session.setAttribute(SESSION_USER_KEY, user);
    }

    public static User getUser(HttpSession session) {
        return (User) session.getAttribute(SESSION_USER_KEY);
    }

    public static boolean isLoggedIn(HttpSession session) {
        return getUser(session) != null;
    }

    public static Long getUserId(HttpSession session) {
        User user = getUser(session);
        return user != null ? user.getId() : null;
    }

    public static UserRole getUserRole(HttpSession session) {
        User user = getUser(session);
        return user != null ? user.getRole() : null;
    }

    public static void requireAdmin(HttpSession session) {
        if (!isLoggedIn(session)) {
            throw new RuntimeException("Unauthorized: Please login first");
        }
        if (getUserRole(session) != UserRole.ADMIN) {
            throw new RuntimeException("Forbidden: Admin access required");
        }
    }

    public static void requireAuthenticated(HttpSession session) {
        if (!isLoggedIn(session)) {
            throw new RuntimeException("Unauthorized: Please login first");
        }
    }

    public static void requireClientOwnership(HttpSession session, Long clientId) {
        requireAuthenticated(session);
        UserRole role = getUserRole(session);
        if (role == UserRole.ADMIN) {
            return;
        }
        Long userId = getUserId(session);
        if (!userId.equals(clientId)) {
            throw new RuntimeException("Forbidden: You can only access your own data");
        }
    }
}
