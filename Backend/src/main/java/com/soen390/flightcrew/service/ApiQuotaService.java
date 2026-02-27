package com.soen390.flightcrew.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Logger;

@Service
public class ApiQuotaService {

    private static final Logger logger = Logger.getLogger(ApiQuotaService.class.getName());
    private static final int MONTHLY_LIMIT = 9_000;
    private static final int PER_MINUTE_LIMIT = 60;

    private final AtomicInteger monthlyCount = new AtomicInteger(0);
    private volatile int currentMonth = LocalDate.now().getMonthValue();
    private volatile int currentYear = LocalDate.now().getYear();

    private final AtomicInteger minuteCount = new AtomicInteger(0);
    private final AtomicLong minuteWindowStart = new AtomicLong(System.currentTimeMillis());

    /**
     * Check if a request is allowed, and if so, consume one unit of quota.
     * Returns true if the request can proceed.
     */
    public synchronized boolean tryConsume() {
        resetMonthIfNeeded();
        resetMinuteIfNeeded();

        if (monthlyCount.get() >= MONTHLY_LIMIT) {
            logger.warning("Monthly Google API quota exhausted: " + monthlyCount.get()
                    + "/" + MONTHLY_LIMIT);
            return false;
        }

        if (minuteCount.get() >= PER_MINUTE_LIMIT) {
            logger.warning("Per-minute Google API rate limit hit: " + minuteCount.get()
                    + "/" + PER_MINUTE_LIMIT);
            return false;
        }

        monthlyCount.incrementAndGet();
        minuteCount.incrementAndGet();
        return true;
    }

    public int getMonthlyUsage() {
        resetMonthIfNeeded();
        return monthlyCount.get();
    }

    public int getMonthlyLimit() {
        return MONTHLY_LIMIT;
    }

    public int getRemainingMonthlyQuota() {
        return MONTHLY_LIMIT - getMonthlyUsage();
    }

    private void resetMonthIfNeeded() {
        LocalDate now = LocalDate.now();
        if (now.getMonthValue() != currentMonth || now.getYear() != currentYear) {
            monthlyCount.set(0);
            currentMonth = now.getMonthValue();
            currentYear = now.getYear();
            logger.info("Monthly API quota reset for " + now.getMonth());
        }
    }

    private void resetMinuteIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - minuteWindowStart.get() > 60_000) {
            minuteCount.set(0);
            minuteWindowStart.set(now);
        }
    }
}
