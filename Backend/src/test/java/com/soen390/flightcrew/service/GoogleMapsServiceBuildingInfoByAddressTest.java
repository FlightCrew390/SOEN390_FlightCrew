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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleMapsServiceBuildingInfoByAddressTest {

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
    @DisplayName("Returns null when address is null")
    void getBuildingInfoByAddress_nullAddress_returnsNull() {
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress(null);

        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns null when address is empty")
    void getBuildingInfoByAddress_emptyAddress_returnsNull() {
        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress("");

        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns geocode response when Google API responds successfully")
    void getBuildingInfoByAddress_success_returnsResponse() {
        GoogleGeocodeResponse mockResponse = new GoogleGeocodeResponse();
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenReturn(ResponseEntity.ok(mockResponse));

        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress("1455 De Maisonneuve Blvd W");

        assertNotNull(result);
        assertSame(mockResponse, result);
    }

    @Test
    @DisplayName("Sends request to the correct Google Geocode API URL")
    void getBuildingInfoByAddress_usesCorrectUrl() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenReturn(ResponseEntity.ok(new GoogleGeocodeResponse()));

        googleMapsService.getBuildingInfoByAddress("1455 De Maisonneuve Blvd W");

        verify(restTemplate).postForEntity(
                eq("https://geocode.googleapis.com/v4alpha/geocode/destinations"),
                any(HttpEntity.class),
                eq(GoogleGeocodeResponse.class));
    }

    @Test
    @DisplayName("Returns null when Google API throws an exception")
    void getBuildingInfoByAddress_googleApiError_returnsNull() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(GoogleGeocodeResponse.class)))
                .thenThrow(new RestClientException("Connection refused"));

        GoogleGeocodeResponse result = googleMapsService.getBuildingInfoByAddress("1455 De Maisonneuve Blvd W");

        assertNull(result);
    }
}
