package com.soen390.flightcrew.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soen390.flightcrew.model.IndoorPointOfInterest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class IndoorPoiServiceTest {

    private IndoorPoiService indoorPoiService;

    @BeforeEach
    void setUp() {
        indoorPoiService = new IndoorPoiService(new ObjectMapper());
    }

    @Test
    @DisplayName("Should load indoor POI data on startup")
    void testDataLoadedOnStartup() {
        Map<String, List<IndoorPointOfInterest>> allPois = indoorPoiService.getAllIndoorPois();
        assertNotNull(allPois);
        assertFalse(allPois.isEmpty());
    }

    @Test
    @DisplayName("Should return POIs for Hall building (H)")
    void testGetPoiForHallBuilding() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("H");
        assertNotNull(pois);
        assertFalse(pois.isEmpty());
        pois.forEach(poi -> assertEquals("H", poi.getBuildingCode()));
    }

    @Test
    @DisplayName("Should be case-insensitive for building codes")
    void testCaseInsensitivity() {
        List<IndoorPointOfInterest> poisUpper = indoorPoiService.getIndoorPoisForBuilding("H");
        List<IndoorPointOfInterest> poisLower = indoorPoiService.getIndoorPoisForBuilding("h");
        assertEquals(poisUpper.size(), poisLower.size());
    }

    @Test
    @DisplayName("Should return empty list for unknown building code")
    void testUnknownBuildingCode() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("ZZ");
        assertNotNull(pois);
        assertTrue(pois.isEmpty());
    }

    @Test
    @DisplayName("Should return empty list for empty building code")
    void testEmptyBuildingCode() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("");
        assertNotNull(pois);
        assertTrue(pois.isEmpty());
    }

    @Test
    @DisplayName("Should return empty list for null building code")
    void testNullBuildingCode() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding(null);
        assertNotNull(pois);
        assertTrue(pois.isEmpty());
    }

    @Test
    @DisplayName("Should return POIs for MB building")
    void testGetPoiForMBBuilding() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("MB");
        assertNotNull(pois);
        assertFalse(pois.isEmpty());
        pois.forEach(poi -> assertEquals("MB", poi.getBuildingCode()));
    }

    @Test
    @DisplayName("Should return POIs for CC building")
    void testGetPoiForCCBuilding() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("CC");
        assertNotNull(pois);
        assertFalse(pois.isEmpty());
        pois.forEach(poi -> assertEquals("CC", poi.getBuildingCode()));
    }

    @Test
    @DisplayName("Should return POIs for VE building")
    void testGetPoiForVEBuilding() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("VE");
        assertNotNull(pois);
        assertFalse(pois.isEmpty());
        pois.forEach(poi -> assertEquals("VE", poi.getBuildingCode()));
    }

    @Test
    @DisplayName("Should return POIs for VL building")
    void testGetPoiForVLBuilding() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("VL");
        assertNotNull(pois);
        assertFalse(pois.isEmpty());
        pois.forEach(poi -> assertEquals("VL", poi.getBuildingCode()));
    }

    @Test
    @DisplayName("Should return POIs for EV building")
    void testGetPoiForEVBuilding() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("EV");
        assertNotNull(pois);
        assertFalse(pois.isEmpty());
        pois.forEach(poi -> assertEquals("EV", poi.getBuildingCode()));
    }

    @Test
    @DisplayName("Should return POIs for SP building")
    void testGetPoiForSPBuilding() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("SP");
        assertNotNull(pois);
        assertFalse(pois.isEmpty());
        pois.forEach(poi -> assertEquals("SP", poi.getBuildingCode()));
    }

    @Test
    @DisplayName("Should contain washroom, fountain, stairs, and elevator categories")
    void testPoisContainAllCategories() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("H");
        assertFalse(pois.isEmpty());

        List<String> categories = pois.stream().map(IndoorPointOfInterest::getCategory).toList();
        assertTrue(categories.contains("washroom"));
        assertTrue(categories.contains("fountain"));
        assertTrue(categories.contains("stairs"));
        assertTrue(categories.contains("elevator"));
    }

    @Test
    @DisplayName("Should have all required fields populated")
    void testPoiFieldsPopulated() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("H");
        assertFalse(pois.isEmpty());

        IndoorPointOfInterest poi = pois.get(0);
        assertNotNull(poi.getId());
        assertNotNull(poi.getName());
        assertNotNull(poi.getCategory());
        assertNotNull(poi.getBuildingCode());
        assertNotNull(poi.getFloor());
        assertNotNull(poi.getLatitude());
        assertNotNull(poi.getLongitude());
        assertNotNull(poi.getDescription());
    }

    @Test
    @DisplayName("Hall building should have multiple floors")
    void testHallHasMultipleFloors() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("H");
        assertFalse(pois.isEmpty());

        List<Integer> floors = pois.stream().map(IndoorPointOfInterest::getFloor).distinct().toList();
        assertTrue(floors.size() > 1);
    }

    @Test
    @DisplayName("POI with coordinates should have x and y values")
    void testPoiWithCoordinatesHasXY() {
        List<IndoorPointOfInterest> pois = indoorPoiService.getIndoorPoisForBuilding("H");
        List<IndoorPointOfInterest> withCoordinates = pois.stream()
                .filter(poi -> poi.getX() != null && poi.getY() != null)
                .toList();

        assertFalse(withCoordinates.isEmpty());
        withCoordinates.forEach(poi -> {
            assertNotNull(poi.getX());
            assertNotNull(poi.getY());
            assertTrue(poi.getX() >= 0);
            assertTrue(poi.getY() >= 0);
        });
    }
}
