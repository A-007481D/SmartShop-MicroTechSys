package com.microtech.microtechsmartmgmt.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class MoneyUtil {

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    public static BigDecimal round(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);
        }
        return value.setScale(SCALE, ROUNDING_MODE);
    }

    public static BigDecimal calculatePercentage(BigDecimal base, double percentage) {
        if (base == null || percentage == 0) {
            return BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);
        }
        return round(base.multiply(BigDecimal.valueOf(percentage / 100)));
    }

    public static final BigDecimal ZERO = BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);
}

