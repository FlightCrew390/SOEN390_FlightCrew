package com.soen390.flightcrew.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.soen390.flightcrew.service.GoogleAuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.io.IOException;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
                "external.api.url=http://mock-api.com",
                "external.api.user=testUser",
                "external.api.key=testKey",
                "google.api.key=testGoogleKey",
                "app.cache.file=non_existent_cache.json",
                "google.client-id=mock-id",
                "google.client-secret=mock-secret"
})
class AuthControllerTest {
        private MockMvc mockMvc;

        @Autowired
        private WebApplicationContext context;

        @MockitoBean
        private GoogleAuthService googleAuthService;

        @BeforeEach
        void setup() {
                this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        }

        @Test
        void testExchangeCode_Success() throws Exception {
                GoogleTokenResponse fakeResponse = new GoogleTokenResponse();
                fakeResponse.setAccessToken("mock_access_token");
                fakeResponse.setRefreshToken("mock_refresh_token");
                fakeResponse.setExpiresInSeconds(3600L);

                when(googleAuthService.exchangeCodeForTokens(anyString(), anyString(), anyString()))
                                .thenReturn(fakeResponse);

                String jsonRequest = "{\"code\": \"test_auth_code\", \"redirectUri\": \"http://localhost:3000/auth\", \"clientId\": \"test-client-id\"}";

                mockMvc.perform(post("/api/v1/auth/google")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonRequest))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.accessToken").value("mock_access_token"))
                                .andExpect(jsonPath("$.refreshToken").value("mock_refresh_token"))
                                .andExpect(jsonPath("$.expiresIn").value(3600));
        }

        @Test
        void testExchangeCode_Failure() throws Exception {
                when(googleAuthService.exchangeCodeForTokens(anyString(), anyString(), anyString()))
                                .thenThrow(new IOException("invalid_grant"));

                String jsonRequest = "{\"code\": \"expired_code\", \"redirectUri\": \"http://localhost:3000/auth\", \"clientId\": \"test-client-id\"}";

                mockMvc.perform(post("/api/v1/auth/google")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonRequest))
                                .andExpect(status().isUnauthorized());
        }

        @ParameterizedTest
        @CsvSource({
                        "{\"redirectUri\": \"http://localhost:3000/auth\", \"clientId\": \"test-client-id\"}",
                        "{\"code\": \"test_auth_code\", \"clientId\": \"test-client-id\"}",
                        "{\"code\": \"test_auth_code\", \"redirectUri\": \"http://localhost:3000/auth\"}"
        })
        void testExchangeCode_MissingRequiredFields(String jsonRequest) throws Exception {
                mockMvc.perform(post("/api/v1/auth/google")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonRequest))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testRefreshToken_Failure() throws Exception {
                when(googleAuthService.refreshAccessToken(anyString(), anyString()))
                                .thenThrow(new IOException("invalid_grant"));
                String jsonRequest = "{\"refreshToken\": \"test_refresh_token\", \"clientId\": \"test-client-id\"}";
                mockMvc.perform(post("/api/v1/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonRequest))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void testRefreshToken_Success() throws Exception {
                GoogleTokenResponse fakeResponse = new GoogleTokenResponse();
                fakeResponse.setAccessToken("new_mock_access_token");
                fakeResponse.setRefreshToken("new_mock_refresh_token");
                fakeResponse.setExpiresInSeconds(3600L);
                when(googleAuthService.refreshAccessToken(anyString(), anyString())).thenReturn(fakeResponse);
                String jsonRequest = "{\"refreshToken\": \"test_refresh_token\", \"clientId\": \"test-client-id\"}";
                mockMvc.perform(post("/api/v1/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonRequest))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.accessToken").value("new_mock_access_token"))
                                .andExpect(jsonPath("$.refreshToken").value("new_mock_refresh_token"))
                                .andExpect(jsonPath("$.expiresIn").value(3600));
        }
}
