package com.soen390.flightcrew.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.soen390.flightcrew.service.GoogleAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> exchangeCode(@RequestBody Map<String, String> request) {
        String authCode = request.get("code");
        
        if (authCode == null || authCode.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing authorization code");
        }

        try {
            GoogleTokenResponse response = googleAuthService.exchangeCodeForTokens(authCode);

            Map<String, Object> tokenMap = new HashMap<>();
            tokenMap.put("accessToken", response.getAccessToken());
            tokenMap.put("refreshToken", response.getRefreshToken());
            tokenMap.put("expiresIn", response.getExpiresInSeconds());

            return ResponseEntity.ok(tokenMap);

        } catch (IOException e) {
            return ResponseEntity.status(401).body("Google exchange failed: " + e.getMessage());
        }
    }
}