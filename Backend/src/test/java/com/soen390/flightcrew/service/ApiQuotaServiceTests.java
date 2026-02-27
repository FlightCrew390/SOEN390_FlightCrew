package com.soen390.flightcrew.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicInteger;
import java.lang.reflect.Field;

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

    @Test
    @DisplayName("Monthly usage increments after each consumed request")
    void tryConsume_incrementsMonthlyUsage() {
        assertEquals(0, quotaService.getMonthlyUsage());

        quotaService.tryConsume();
        assertEquals(1, quotaService.getMonthlyUsage());

        quotaService.tryConsume();
        assertEquals(2, quotaService.getMonthlyUsage());
    }

    @Test
    @DisplayName("Remaining quota decreases with each request")
    void getRemainingMonthlyQuota_decreasesAfterConsumption() {
        int initialRemaining = quotaService.getRemainingMonthlyQuota();

        quotaService.tryConsume();

        assertEquals(initialRemaining - 1, quotaService.getRemainingMonthlyQuota());
    }

    @Test
    @DisplayName("Monthly limit returns the configured cap")
    void getMonthlyLimit_returnsConfiguredCap() {
        // The service is configured with MONTHLY_LIMIT = 9000
        assertEquals(9000, quotaService.getMonthlyLimit());
    }

    // ── Monthly exhaustion ───────────────────────────────────────────

    @Test
    @DisplayName("Requests are rejected once monthly quota is exhausted")
    void tryConsume_rejectsWhenMonthlyQuotaExhausted() throws Exception {
        // Set the monthly counter to just below the limit via reflection
        // to avoid hitting the per-minute limit (60) on the way to 9000
        Field monthlyCountField = ApiQuotaService.class.getDeclaredField("monthlyCount");
        monthlyCountField.setAccessible(true);
        AtomicInteger monthlyCount = (AtomicInteger) monthlyCountField.get(quotaService);
        monthlyCount.set(8999);

        // 9000th request — should still be allowed
        assertTrue(quotaService.tryConsume());
        assertEquals(9000, quotaService.getMonthlyUsage());

        // 9001st request — must be rejected
        assertFalse(quotaService.tryConsume());
        assertEquals(9000, quotaService.getMonthlyUsage());
        assertEquals(0, quotaService.getRemainingMonthlyQuota());
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

    @Test
    @DisplayName("Monthly usage still reflects consumed count even after per-minute rejection")
    void tryConsume_monthlyCountAccurateAfterMinuteRejection() {
        for (int i = 0; i < 60; i++) {
            quotaService.tryConsume();
        }

        // This one is rejected — monthly count should NOT increment
        assertFalse(quotaService.tryConsume());
        assertEquals(60, quotaService.getMonthlyUsage());
    }

    // ── Multiple sequential requests ─────────────────────────────────

    @Test
    @DisplayName("Multiple sequential requests within limits all succeed")
    void tryConsume_multipleSequentialRequests_allSucceed() {
        for (int i = 0; i < 50; i++) {
            assertTrue(quotaService.tryConsume());
        }
        assertEquals(50, quotaService.getMonthlyUsage());
    }

    // ── Initial state ────────────────────────────────────────────────

    @Test
    @DisplayName("Fresh service starts with zero usage")
    void initialState_zeroUsage() {
        assertEquals(0, quotaService.getMonthlyUsage());
    }

    @Test
    @DisplayName("Fresh service has full remaining quota")
    void initialState_fullRemainingQuota() {
        assertEquals(quotaService.getMonthlyLimit(), quotaService.getRemainingMonthlyQuota());
    }
}
