package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.GoogleGeocodeRequest;
import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleMapsService {

    @Value("${google.api.key}")
    private String googleApiKey;

    private final RestTemplate restTemplate;
    private final String GOOGLE_GEOCODE_URL = "https://geocode.googleapis.com/v4alpha/geocode/destinations";

    public GoogleMapsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Cacheable("buildingInfo")
    public GoogleGeocodeResponse getBuildingInfo(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleApiKey);
        headers.set("X-Goog-FieldMask", "*");

        GoogleGeocodeRequest request = new GoogleGeocodeRequest(
                new GoogleGeocodeRequest.LocationQuery(
                        new GoogleGeocodeRequest.Location(latitude, longitude)));

        HttpEntity<GoogleGeocodeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<GoogleGeocodeResponse> response = restTemplate.postForEntity(
                    GOOGLE_GEOCODE_URL,
                    entity,
                    GoogleGeocodeResponse.class);
            return response.getBody();
        } catch (Exception e) {
            // Log error but don't fail the whole request?
            // For now, print stack trace and return null so the main flow continues
            e.printStackTrace();
            return null;
        }
    }
}
