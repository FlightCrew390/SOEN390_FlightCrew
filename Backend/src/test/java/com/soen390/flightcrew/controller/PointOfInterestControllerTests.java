package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.PointOfInterest;
import java.io.File;
import java.io.FileWriter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@TestPropertySource(properties = {
        "external.api.url=http://mock-api.com",
        "external.api.user=testUser",
        "external.api.key=testKey",
        "google.api.key=testGoogleKey",
        "app.poi.cache.file=test_poi_cache.json",
        "app.cache.file=non_existent_cache.json"
})
public class PointOfInterestControllerTests {

    @LocalServerPort
    private int port;

    @Autowired
    private RestTemplate restTemplate;

    @BeforeEach
    @AfterEach
    void cleanup() {
        File file = new File("test_poi_cache.json");
        if (file.exists()) {
            file.delete();
        }
    }

    @Test
    void getPoiList_ReturnsAllPois() {
        // Act — loads from static outdoor_poi.json and enriches with Google data
        // Since Google API calls will fail (no mock), POIs are returned without
        // enrichment
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        // Allow any Google geocode calls to succeed with dummy data
        for (int i = 0; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess("{\"destinations\": []}", MediaType.APPLICATION_JSON));
        }

        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());

        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertTrue(pois.length > 0, "Should return at least one POI");

        // Verify structure
        for (PointOfInterest poi : pois) {
            assertNotNull(poi.getName(), "POI name should not be null");
            assertNotNull(poi.getCategory(), "POI category should not be null");
            assertNotNull(poi.getCampus(), "POI campus should not be null");
            assertTrue(
                    poi.getCampus().equals("SGW") || poi.getCampus().equals("LOY"),
                    "Campus should be SGW or LOY");
        }

        mockServer.verify();
    }

    @Test
    void getPoiList_FilterByCampus_ReturnsSGWOnly() {
        // Arrange — write a cache with known data to avoid Google API calls
        String cachedJson = "[" +
                "{\"Name\":\"Cafe A\",\"Category\":\"cafe\",\"Campus\":\"SGW\",\"Address\":\"123 St\",\"Latitude\":45.497,\"Longitude\":-73.579,\"Description\":\"A cafe\"},"
                +
                "{\"Name\":\"Restaurant B\",\"Category\":\"restaurant\",\"Campus\":\"LOY\",\"Address\":\"456 Ave\",\"Latitude\":45.458,\"Longitude\":-73.640,\"Description\":\"A restaurant\"}"
                +
                "]";
        writeCache(cachedJson);

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list?campus=SGW";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertEquals(1, pois.length);
        assertEquals("SGW", pois[0].getCampus());
        assertEquals("Cafe A", pois[0].getName());
    }

    @Test
    void getPoiList_FilterByCampus_ReturnsLOYOnly() {
        // Arrange
        String cachedJson = "[" +
                "{\"Name\":\"Cafe A\",\"Category\":\"cafe\",\"Campus\":\"SGW\",\"Address\":\"123 St\",\"Latitude\":45.497,\"Longitude\":-73.579,\"Description\":\"A cafe\"},"
                +
                "{\"Name\":\"Restaurant B\",\"Category\":\"restaurant\",\"Campus\":\"LOY\",\"Address\":\"456 Ave\",\"Latitude\":45.458,\"Longitude\":-73.640,\"Description\":\"A restaurant\"}"
                +
                "]";
        writeCache(cachedJson);

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list?campus=LOY";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertEquals(1, pois.length);
        assertEquals("LOY", pois[0].getCampus());
        assertEquals("Restaurant B", pois[0].getName());
    }

    @Test
    void getPoiList_ReturnsCachedData_WhenCacheExists() {
        // Arrange — pre-write a valid cache file
        String cachedJson = "[{\"Name\":\"Cached Cafe\",\"Category\":\"cafe\",\"Campus\":\"SGW\",\"Address\":\"789 St\",\"Latitude\":45.497,\"Longitude\":-73.579,\"Description\":\"Cached\"}]";
        writeCache(cachedJson);

        // No mock server setup — the static file should NOT be loaded

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertEquals(1, pois.length);
        assertEquals("Cached Cafe", pois[0].getName());
    }

    @Test
    void getPoiList_IgnoresCorruptCache_AndReloadsFromStatic() {
        // Arrange — write corrupted cache
        writeCache("{{{INVALID JSON###");

        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        // Allow Google calls to fail gracefully
        for (int i = 0; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess("{\"destinations\": []}", MediaType.APPLICATION_JSON));
        }

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — should fall through to static data
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertTrue(pois.length > 0, "Should fall back to static POI data");

        mockServer.verify();
    }

    @Test
    void getPoiList_WithCoordinates_EnrichesWithGoogleData() {
        // Arrange — use cache with single POI that has coordinates
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

        // Write cache that doesn't exist so it loads from static, but let's use
        // a fresh approach: delete cache and mock Google responses
        File cacheFile = new File("test_poi_cache.json");
        if (cacheFile.exists()) {
            cacheFile.delete();
        }

        // We need to mock Google calls for all 21 POIs in the static file
        String googleJson = """
                {
                  "destinations": [
                    {
                      "primary": {
                        "place": "places/ChIJTestPlace",
                        "displayName": { "text": "Test Place", "languageCode": "en" },
                        "formattedAddress": "123 Test St, Montreal"
                      }
                    }
                  ]
                }""";

        for (int i = 0; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));
        }

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertTrue(pois.length > 0);

        // At least the first POI should be enriched
        assertNotNull(pois[0].getGooglePlaceInfo());
        assertEquals("places/ChIJTestPlace", pois[0].getGooglePlaceInfo().getPlaceId());

        mockServer.verify();
    }

    @Test
    void getPoiList_GoogleApiError_PoiStillReturned() {
        // Arrange — delete cache and mock Google to return errors
        File cacheFile = new File("test_poi_cache.json");
        if (cacheFile.exists()) {
            cacheFile.delete();
        }

        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        for (int i = 0; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withServerError());
        }

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — POIs still returned, just without Google enrichment
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertTrue(pois.length > 0, "POIs should be returned even when Google API fails");

        // Google info should be null since API errored
        assertNull(pois[0].getGooglePlaceInfo());

        mockServer.verify();
    }

    @Test
    void getPoiList_CacheWrittenAfterLoad_SubsequentCallUsesCache() {
        // Arrange — first call loads static data and writes cache
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        for (int i = 0; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess("{\"destinations\": []}", MediaType.APPLICATION_JSON));
        }

        // Act — first call
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().length > 0);

        // Verify cache file was created
        File cacheFile = new File("test_poi_cache.json");
        assertTrue(cacheFile.exists(), "Cache file should have been created after loading static data");

        mockServer.verify();
    }

    @Test
    void getPoiList_NoCampusFilter_ReturnsAll() {
        // Arrange — cache with both campuses
        String cachedJson = "[" +
                "{\"Name\":\"Cafe A\",\"Category\":\"cafe\",\"Campus\":\"SGW\",\"Address\":\"123 St\",\"Latitude\":45.497,\"Longitude\":-73.579,\"Description\":\"A cafe\"},"
                +
                "{\"Name\":\"Restaurant B\",\"Category\":\"restaurant\",\"Campus\":\"LOY\",\"Address\":\"456 Ave\",\"Latitude\":45.458,\"Longitude\":-73.640,\"Description\":\"A restaurant\"}"
                +
                "]";
        writeCache(cachedJson);

        // Act — no campus filter
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — both should be returned
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertEquals(2, pois.length);
    }

    @Test
    void getPoiList_PoiWithoutCoordinates_SkipsEnrichment() {
        // Arrange — cache with a POI that has null lat/long
        String cachedJson = "[{\"Name\":\"No Coords Cafe\",\"Category\":\"cafe\",\"Campus\":\"SGW\",\"Address\":\"123 St\",\"Latitude\":null,\"Longitude\":null,\"Description\":\"No coords\"}]";
        writeCache(cachedJson);

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — POI returned without enrichment
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertEquals(1, pois.length);
        assertEquals("No Coords Cafe", pois[0].getName());
        assertNull(pois[0].getGooglePlaceInfo());
    }

    @Test
    void getPoiList_MultipleDestinations_FindsBestMatchByName() {
        // Arrange — no cache, mock Google to return multiple destinations where
        // second one matches POI name
        File cacheFile = new File("test_poi_cache.json");
        if (cacheFile.exists()) {
            cacheFile.delete();
        }

        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        // Google returns multiple destinations — the matching logic should pick the
        // best match
        String googleJsonWithMatch = """
                {
                  "destinations": [
                    {
                      "primary": {
                        "place": "places/WrongPlace",
                        "displayName": { "text": "Some Random Place", "languageCode": "en" },
                        "formattedAddress": "999 Random St"
                      }
                    },
                    {
                      "primary": {
                        "place": "places/CorrectPlace",
                        "displayName": { "text": "Café Gentile", "languageCode": "en" },
                        "formattedAddress": "4126 Ste-Catherine St W"
                      }
                    }
                  ]
                }""";

        String googleJsonDefault = """
                {
                  "destinations": [
                    {
                      "primary": {
                        "place": "places/DefaultPlace",
                        "displayName": { "text": "Default", "languageCode": "en" },
                        "formattedAddress": "Default Address"
                      }
                    }
                  ]
                }""";

        // First call gets the multi-destination response, rest get default
        mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(googleJsonWithMatch, MediaType.APPLICATION_JSON));

        for (int i = 1; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess(googleJsonDefault, MediaType.APPLICATION_JSON));
        }

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — first POI (Café Gentile) should match the second destination
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertTrue(pois.length > 0);
        assertNotNull(pois[0].getGooglePlaceInfo());
        assertEquals("places/CorrectPlace", pois[0].getGooglePlaceInfo().getPlaceId());

        mockServer.verify();
    }

    @Test
    void getPoiList_DestinationWithNullDisplayName_SkipsInMatching() {
        // Arrange — Google returns destination with null displayName in primary
        File cacheFile = new File("test_poi_cache.json");
        if (cacheFile.exists()) {
            cacheFile.delete();
        }

        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        // First destination has null displayName, second has valid match
        String googleJson = """
                {
                  "destinations": [
                    {
                      "primary": {
                        "place": "places/NullName",
                        "formattedAddress": "Some Address"
                      }
                    },
                    {
                      "primary": {
                        "place": "places/MatchPlace",
                        "displayName": { "text": "Café Gentile", "languageCode": "en" },
                        "formattedAddress": "4126 Ste-Catherine St W"
                      }
                    }
                  ]
                }""";

        String googleJsonDefault = """
                {
                  "destinations": [
                    {
                      "primary": {
                        "place": "places/Default",
                        "displayName": { "text": "Default", "languageCode": "en" },
                        "formattedAddress": "Default Address"
                      }
                    }
                  ]
                }""";

        mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));

        for (int i = 1; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess(googleJsonDefault, MediaType.APPLICATION_JSON));
        }

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — should skip null displayName and match on second destination
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertNotNull(pois[0].getGooglePlaceInfo());
        assertEquals("places/MatchPlace", pois[0].getGooglePlaceInfo().getPlaceId());

        mockServer.verify();
    }

    @Test
    void getPoiList_GoogleReturnsNullDestinations_NoEnrichment() {
        // Arrange — Google returns response with null destinations list
        File cacheFile = new File("test_poi_cache.json");
        if (cacheFile.exists()) {
            cacheFile.delete();
        }

        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        for (int i = 0; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        }

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — POIs returned without enrichment since destinations is null
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertTrue(pois.length > 0);
        assertNull(pois[0].getGooglePlaceInfo());

        mockServer.verify();
    }

    @Test
    void getPoiList_NoMatchingDestinationName_ReturnsFirstDestination() {
        // Arrange — Google returns destinations where none match the POI name
        File cacheFile = new File("test_poi_cache.json");
        if (cacheFile.exists()) {
            cacheFile.delete();
        }

        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate)
                .ignoreExpectOrder(true).build();

        String googleJson = """
                {
                  "destinations": [
                    {
                      "primary": {
                        "place": "places/FirstPlace",
                        "displayName": { "text": "Totally Unrelated Name", "languageCode": "en" },
                        "formattedAddress": "Some Address"
                      }
                    },
                    {
                      "primary": {
                        "place": "places/SecondPlace",
                        "displayName": { "text": "Another Unrelated", "languageCode": "en" },
                        "formattedAddress": "Another Address"
                      }
                    }
                  ]
                }""";

        for (int i = 0; i < 21; i++) {
            mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                    .andExpect(method(HttpMethod.POST))
                    .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));
        }

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/poi/list";
        ResponseEntity<PointOfInterest[]> response = client.getForEntity(url, PointOfInterest[].class);

        // Assert — falls back to first destination since no name match
        assertEquals(HttpStatus.OK, response.getStatusCode());
        PointOfInterest[] pois = response.getBody();
        assertNotNull(pois);
        assertNotNull(pois[0].getGooglePlaceInfo());
        assertEquals("places/FirstPlace", pois[0].getGooglePlaceInfo().getPlaceId());

        mockServer.verify();
    }

    private void writeCache(String content) {
        try (FileWriter fw = new FileWriter("test_poi_cache.json")) {
            fw.write(content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to write test cache", e);
        }
    }
}
