package com.soen390.flightcrew.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.soen390.flightcrew.model.GoogleTokenDTO;
import com.soen390.flightcrew.service.GoogleAuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<GoogleTokenDTO> exchangeCode(@RequestBody Map<String, String> request) {
        String authCode = request.get("code");
        
        if (authCode == null || authCode.isEmpty()) {
            throw new IllegalArgumentException("Missing authorization code");
        }

        try {
            GoogleTokenResponse response = googleAuthService.exchangeCodeForTokens(authCode);

            return ResponseEntity.ok(new GoogleTokenDTO(
            response.getAccessToken(),
            response.getRefreshToken(),
            response.getExpiresInSeconds()
    ));

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google exchange failed: " + e.getMessage());
        }
    }
}