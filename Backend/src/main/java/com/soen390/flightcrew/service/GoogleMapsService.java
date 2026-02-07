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

        GoogleGeocodeRequest request = new GoogleGeocodeRequest();
        request.setLocationQuery(new GoogleGeocodeRequest.LocationQuery(
                new GoogleGeocodeRequest.Location(latitude, longitude)));

        HttpEntity<GoogleGeocodeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<GoogleGeocodeResponse> response = restTemplate.postForEntity(
                    GOOGLE_GEOCODE_URL,
                    entity,
                    GoogleGeocodeResponse.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Cacheable("buildingInfoByAddress")
    public GoogleGeocodeResponse getBuildingInfoByAddress(String address) {
        if (address == null || address.isEmpty()) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleApiKey);
        headers.set("X-Goog-FieldMask", "*");

        GoogleGeocodeRequest request = new GoogleGeocodeRequest();
        request.setAddressQuery(
                new GoogleGeocodeRequest.AddressQuery(address));

        HttpEntity<GoogleGeocodeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<GoogleGeocodeResponse> response = restTemplate.postForEntity(
                    GOOGLE_GEOCODE_URL,
                    entity,
                    GoogleGeocodeResponse.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
