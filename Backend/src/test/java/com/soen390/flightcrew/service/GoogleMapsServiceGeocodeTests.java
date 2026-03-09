package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleMapsServiceGeocodeTests {

    @Mock
    private RestTemplate restTemplate;
    @Mock
    private ApiQuotaService quotaService;
    private GoogleMapsService googleMapsService;

    @BeforeEach
    void setUp() {
        googleMapsService = new GoogleMapsService(restTemplate, quotaService);
        ReflectionTestUtils.setField(googleMapsService, "googleApiKey", "fake-test-key");
    }

    @Test
    @DisplayName("Returns geocode info for valid lat/lng")
    void getBuildingInfo_success_returnsResponse() {
        GoogleGeocodeResponse mockResponse = new GoogleGeocodeResponse();
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenReturn(ResponseEntity.ok(mockResponse));
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfo(45.5, -73.6);
        assertNotNull(result);
    }

    @Test
    @DisplayName("Returns null for null latitude")
    void getBuildingInfo_nullLat_returnsNull() {
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfo(null, -73.6);
        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns null for null longitude")
    void getBuildingInfo_nullLng_returnsNull() {
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfo(45.5, null);
        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns null when Google API throws exception")
    void getBuildingInfo_apiThrows_returnsNull() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenThrow(new RuntimeException("API error"));
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfo(45.5, -73.6);
        assertNull(result);
    }

    @Test
    @DisplayName("Returns null when Google API returns empty body")
    void getBuildingInfo_emptyBody_returnsNull() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenReturn(ResponseEntity.ok(null));
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfo(45.5, -73.6);
        assertNull(result);
    }

    @Test
    @DisplayName("Returns geocode info for valid address")
    void getBuildingInfoByAddress_success_returnsResponse() {
        GoogleGeocodeResponse mockResponse = new GoogleGeocodeResponse();
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenReturn(ResponseEntity.ok(mockResponse));
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress("1455 De Maisonneuve Blvd W");
        assertNotNull(result);
    }

    @Test
    @DisplayName("Returns null for null address")
    void getBuildingInfoByAddress_null_returnsNull() {
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress(null);
        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns null for empty address")
    void getBuildingInfoByAddress_empty_returnsNull() {
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress("");
        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns null when Google API throws exception (address)")
    void getBuildingInfoByAddress_apiThrows_returnsNull() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenThrow(new RuntimeException("API error"));
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress("1455 De Maisonneuve Blvd W");
        assertNull(result);
    }

    @Test
    @DisplayName("Returns null when Google API returns empty body (address)")
    void getBuildingInfoByAddress_emptyBody_returnsNull() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenReturn(ResponseEntity.ok(null));
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress("1455 De Maisonneuve Blvd W");
        assertNull(result);
    }
}
