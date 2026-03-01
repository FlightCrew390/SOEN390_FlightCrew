package com.soen390.flightcrew.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiQuotaServiceTest {

    private ApiQuotaService quotaService;

    @BeforeEach
    void setUp() {
        quotaService = new ApiQuotaService();
    }

    // ── Basic operation ──────────────────────────────────────────────

    @Test
    @DisplayName("First request should be allowed")
    void tryConsume_firstRequest_returnsTrue() {
        assertTrue(quotaService.tryConsume());
    }

    // ── Per-minute rate limiting ─────────────────────────────────────

    @Test
    @DisplayName("Requests are rejected once per-minute limit is hit")
    void tryConsume_rejectsWhenPerMinuteLimitHit() {
        // Per-minute limit is 60
        for (int i = 0; i < 60; i++) {
            assertTrue(quotaService.tryConsume(), "Request #" + (i + 1) + " should be allowed");
        }

        // 61st request within the same minute window should be rejected
        assertFalse(quotaService.tryConsume());
    }

    // ── Multiple sequential requests ─────────────────────────────────

    @Test
    @DisplayName("Multiple sequential requests within limits all succeed")
    void tryConsume_multipleSequentialRequests_allSucceed() {
        for (int i = 0; i < 50; i++) {
            assertTrue(quotaService.tryConsume());
        }
        assertEquals(50, quotaService.getMinuteCount());
    }

    // ── Initial state ────────────────────────────────────────────────

    @Test
    @DisplayName("Fresh service starts with zero usage")
    void initialState_zeroUsage() {
        assertEquals(0, quotaService.getMinuteCount());
    }
}
