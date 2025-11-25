package com.microtech.microtechsmartmgmt.dto.response;

import com.microtech.microtechsmartmgmt.enums.UserRole;

public record AuthResponse(
        Long id,
        String username,
        UserRole role,
        String message
) {
}
