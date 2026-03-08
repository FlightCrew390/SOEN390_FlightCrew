package com.soen390.flightcrew.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soen390.flightcrew.model.GoogleGeocodeResponse;
import com.soen390.flightcrew.model.PointOfInterest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PointOfInterestServiceTests {

    @Mock
    private GoogleMapsService googleMapsService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private PointOfInterestService service;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        service = new PointOfInterestService(googleMapsService, objectMapper);
        String cachePath = tempDir.resolve("test_poi_cache.json").toString();
        ReflectionTestUtils.setField(service, "cacheFileName", cachePath);
    }

    // ── Helper ──

    private PointOfInterest makePoi(String name, String category, String campus) {
        PointOfInterest poi = new PointOfInterest();
        poi.setName(name);
        poi.setCategory(category);
        poi.setCampus(campus);
        poi.setLatitude(45.496);
        poi.setLongitude(-73.5795);
        poi.setAddress("123 Test St");
        poi.setDescription("Test POI");
        return poi;
    }

    private GoogleGeocodeResponse makeGoogleResponse(String placeName) {
        GoogleGeocodeResponse response = new GoogleGeocodeResponse();
        GoogleGeocodeResponse.Destination dest = new GoogleGeocodeResponse.Destination();
        GoogleGeocodeResponse.PrimaryPlace place = new GoogleGeocodeResponse.PrimaryPlace();
        GoogleGeocodeResponse.DisplayName displayName = new GoogleGeocodeResponse.DisplayName();
        displayName.setText(placeName);
        place.setDisplayName(displayName);
        dest.setPrimary(place);
        response.setDestinations(List.of(dest));
        return response;
    }

    // ── Cache hit ──

    @Test
    @DisplayName("Returns cached POIs when cache file exists")
    void getAllPois_cacheExists_returnsCachedData() throws IOException {
        PointOfInterest poi = makePoi("Cached Cafe", "cafe", "SGW");
        File cacheFile = tempDir.resolve("test_poi_cache.json").toFile();
        objectMapper.writeValue(cacheFile, List.of(poi));

        List<PointOfInterest> result = service.getAllPois(null);

        assertEquals(1, result.size());
        assertEquals("Cached Cafe", result.get(0).getName());
        verifyNoInteractions(googleMapsService);
    }

    @Test
    @DisplayName("Filters cached POIs by campus")
    void getAllPois_cacheExists_filtersByCampus() throws IOException {
        List<PointOfInterest> pois = List.of(
                makePoi("SGW Cafe", "cafe", "SGW"),
                makePoi("LOY Cafe", "cafe", "LOY"));
        File cacheFile = tempDir.resolve("test_poi_cache.json").toFile();
        objectMapper.writeValue(cacheFile, pois);

        List<PointOfInterest> result = service.getAllPois("SGW");

        assertEquals(1, result.size());
        assertEquals("SGW Cafe", result.get(0).getName());
    }

    @Test
    @DisplayName("Returns all when campus is null or empty")
    void getAllPois_nullOrEmptyCampus_returnsAll() throws IOException {
        List<PointOfInterest> pois = List.of(
                makePoi("Cafe 1", "cafe", "SGW"),
                makePoi("Cafe 2", "cafe", "LOY"));
        File cacheFile = tempDir.resolve("test_poi_cache.json").toFile();
        objectMapper.writeValue(cacheFile, pois);

        assertEquals(2, service.getAllPois(null).size());
        assertEquals(2, service.getAllPois("").size());
    }

    // ── Cache miss → loads static and enriches ──

    @Test
    @DisplayName("Loads static POIs and enriches when no cache")
    void getAllPois_noCache_loadsAndEnriches() {
        GoogleGeocodeResponse response = makeGoogleResponse("Matched Place");
        when(googleMapsService.getBuildingInfo(any(), any())).thenReturn(response);

        List<PointOfInterest> result = service.getAllPois(null);

        assertFalse(result.isEmpty());
        verify(googleMapsService, atLeastOnce()).getBuildingInfo(any(), any());
        // Cache file should be created
        assertTrue(tempDir.resolve("test_poi_cache.json").toFile().exists());
    }

    // ── enrichPoi edge cases ──

    @Test
    @DisplayName("Null google response does not crash enrichment")
    void enrichPoi_nullResponse_continues() {
        when(googleMapsService.getBuildingInfo(any(), any())).thenReturn(null);

        List<PointOfInterest> result = service.getAllPois(null);

        assertFalse(result.isEmpty());
    }

    @Test
    @DisplayName("Empty destinations does not crash enrichment")
    void enrichPoi_emptyDestinations_continues() {
        GoogleGeocodeResponse response = new GoogleGeocodeResponse();
        response.setDestinations(Collections.emptyList());
        when(googleMapsService.getBuildingInfo(any(), any())).thenReturn(response);

        List<PointOfInterest> result = service.getAllPois(null);

        assertFalse(result.isEmpty());
    }

    @Test
    @DisplayName("Null destinations does not crash enrichment")
    void enrichPoi_nullDestinations_continues() {
        GoogleGeocodeResponse response = new GoogleGeocodeResponse();
        response.setDestinations(null);
        when(googleMapsService.getBuildingInfo(any(), any())).thenReturn(response);

        List<PointOfInterest> result = service.getAllPois(null);

        assertFalse(result.isEmpty());
    }

    @Test
    @DisplayName("RuntimeException during enrichment is caught gracefully")
    void enrichPoi_runtimeException_catches() {
        when(googleMapsService.getBuildingInfo(any(), any()))
                .thenThrow(new RuntimeException("API error"));

        List<PointOfInterest> result = service.getAllPois(null);

        assertFalse(result.isEmpty());
    }

    // ── Cache I/O errors ──

    @Test
    @DisplayName("Corrupted cache file falls back to static load")
    void loadFromCache_corruptedFile_fallsToStatic() throws IOException {
        File cacheFile = tempDir.resolve("test_poi_cache.json").toFile();
        java.nio.file.Files.writeString(cacheFile.toPath(), "NOT VALID JSON!!!");

        GoogleGeocodeResponse response = makeGoogleResponse("Fallback Place");
        when(googleMapsService.getBuildingInfo(any(), any())).thenReturn(response);

        List<PointOfInterest> result = service.getAllPois(null);

        assertFalse(result.isEmpty());
    }

    @Test
    @DisplayName("Second call uses cache written by first call")
    void getAllPois_secondCall_usesCache() {
        GoogleGeocodeResponse response = makeGoogleResponse("Enriched Place");
        when(googleMapsService.getBuildingInfo(any(), any())).thenReturn(response);

        // First call — loads static, enriches, writes cache
        List<PointOfInterest> first = service.getAllPois(null);
        assertFalse(first.isEmpty());

        // Reset mock interactions
        reset(googleMapsService);

        // Second call — should read from cache, no google calls
        List<PointOfInterest> second = service.getAllPois(null);
        assertFalse(second.isEmpty());
        verifyNoInteractions(googleMapsService);
    }

    @Test
    @DisplayName("saveToCache handles unwritable path gracefully")
    void saveToCache_unwritablePath_doesNotThrow() {
        // Point cache to a directory that doesn't exist deeply
        ReflectionTestUtils.setField(service, "cacheFileName",
                tempDir.resolve("nonexistent/deeply/nested/cache.json").toString());

        GoogleGeocodeResponse response = makeGoogleResponse("Place");
        when(googleMapsService.getBuildingInfo(any(), any())).thenReturn(response);

        // Should not throw even though cache write fails
        assertDoesNotThrow(() -> service.getAllPois(null));
    }
}
