package com.soen390.flightcrew.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

class GoogleAuthServiceTest {

    private GoogleAuthService googleAuthService;

    @BeforeEach
    void setUp() {
        googleAuthService = new GoogleAuthService();

        ReflectionTestUtils.setField(googleAuthService, "clientId", "test-client-id");
        ReflectionTestUtils.setField(googleAuthService, "clientSecret", "test-client-secret");
    }

    @Test
    void testExchangeCodeForTokens_ThrowsExceptionOnInvalidCode() {
        // Since we can't easily mock the internal Google SDK 'new' call without
        // advanced tools,
        // this test confirms that the service properly propagates IOExceptions
        // when the network call fails (which it will, because the code is fake).

        String fakeCode = "invalid-code";
        String redirectUri = "http://localhost:3000/auth";
        String clientId = "test-client-id";

        assertThrows(IOException.class, () -> {
            googleAuthService.exchangeCodeForTokens(fakeCode, redirectUri, clientId);
        });
    }

    @Test
    void testValueInjection() {
        // Verifies that our Reflection utility correctly set the private fields
        String clientId = (String) ReflectionTestUtils.getField(googleAuthService, "clientId");
        assertEquals("test-client-id", clientId);
    }

    @Test
    void testRefreshAccessToken_ThrowsExceptionOnInvalidRefreshToken() {
        // Similar to the previous test, we confirm that an IOException is thrown
        // when the refresh token is invalid and the network call fails.

        String fakeRefreshToken = "invalid-refresh-token";
        String clientId = "test-client-id";

        assertThrows(IOException.class, () -> {
            googleAuthService.refreshAccessToken(fakeRefreshToken, clientId);
        });
    }
}
