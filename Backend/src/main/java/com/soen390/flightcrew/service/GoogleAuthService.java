package com.soen390.flightcrew.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;

@Service
public class GoogleAuthService {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    public GoogleTokenResponse exchangeCodeForTokens(String authCode) throws IOException {
        
        //Used for testing
        //String redirectUri = "https://developers.google.com/oauthplayground";
        
        String redirectUri = "postmessage";

        return new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(),
                new GsonFactory(),
                "https://oauth2.googleapis.com/token",
                clientId,
                clientSecret,
                authCode,
                redirectUri
        ).execute();
    }
}
