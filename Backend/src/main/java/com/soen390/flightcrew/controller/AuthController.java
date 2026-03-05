package com.soen390.flightcrew.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @PostMapping("/google")
    public ResponseEntity<?> exchangeCode(@RequestBody Map<String, String> request) {
        String authCode = request.get("code");

        try {
            GoogleTokenResponse response = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    new GsonFactory(),
                    "https://oauth2.googleapis.com/token",
                    clientId,
                    clientSecret,
                    authCode,
                    "postmessage"
                    //"https://developers.google.com/oauthplayground"
            ).execute();

            Map<String, Object> tokens = new HashMap<>();
            tokens.put("accessToken", response.getAccessToken());
            tokens.put("refreshToken", response.getRefreshToken());
            tokens.put("expiresIn", response.getExpiresInSeconds());
            
            return ResponseEntity.ok(tokens);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body("Token exchange failed: " + e.getMessage());
        }
    }
}