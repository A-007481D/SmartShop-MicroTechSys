package com.microtech.microtechsmartmgmt.dto.response;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        BigDecimal totalRevenue,
        long totalOrders,
        long activeClients,
        BigDecimal avgOrderValue) {
}
