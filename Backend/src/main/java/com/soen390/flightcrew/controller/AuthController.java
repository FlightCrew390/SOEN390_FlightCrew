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
        String redirectUri = request.get("redirectUri");
        String clientId = request.get("clientId");

        if (authCode == null || authCode.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing authorization code");
        }
        if (redirectUri == null || redirectUri.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing redirect URI");
        }
        if (clientId == null || clientId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing client ID");
        }

        try {
            GoogleTokenResponse response = googleAuthService.exchangeCodeForTokens(
                    authCode, redirectUri, clientId);
            return ResponseEntity.ok(new GoogleTokenDTO(
                    response.getAccessToken(),
                    response.getRefreshToken(),
                    response.getExpiresInSeconds()));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Google exchange failed: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<GoogleTokenDTO> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        String clientId = request.get("clientId");

        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new IllegalArgumentException("Missing refresh token");
        }
        if (clientId == null || clientId.isEmpty()) {
            throw new IllegalArgumentException("Missing client ID");
        }

        try {
            GoogleTokenResponse response = googleAuthService.refreshAccessToken(refreshToken, clientId);
            return ResponseEntity.ok(new GoogleTokenDTO(
                    response.getAccessToken(),
                    response.getRefreshToken() != null ? response.getRefreshToken() : refreshToken,
                    response.getExpiresInSeconds()));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token refresh failed: " + e.getMessage());
        }
    }
}
