package com.soen390.flightcrew.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ApiQuotaService {

    private static final Logger logger = LoggerFactory.getLogger(ApiQuotaService.class);
    private static final int PER_MINUTE_LIMIT = 60;

    private final AtomicInteger minuteCount = new AtomicInteger(0);
    private final AtomicLong minuteWindowStart = new AtomicLong(System.currentTimeMillis());

    /**
     * Check if a request is allowed, and if so, consume one unit of quota.
     * Returns true if the request can proceed.
     */
    public synchronized boolean tryConsume() {
        resetMinuteIfNeeded();

        if (minuteCount.get() >= PER_MINUTE_LIMIT) {
            logger.warn("Per-minute Google API rate limit hit: {}/{}", minuteCount.get(), PER_MINUTE_LIMIT);
            return false;
        }

        minuteCount.incrementAndGet();
        return true;
    }

    private void resetMinuteIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - minuteWindowStart.get() > 60_000) {
            minuteCount.set(0);
            minuteWindowStart.set(now);
        }
    }

    public int getMinuteCount() {
        resetMinuteIfNeeded();
        return minuteCount.get();
    }
}
