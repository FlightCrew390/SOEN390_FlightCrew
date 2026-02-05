package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.Building;
import java.io.File;
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
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@TestPropertySource(properties = {
        "external.api.url=http://mock-api.com",
        "external.api.user=testUser",
        "external.api.key=testKey",
        "google.api.key=testGoogleKey",
        "app.cache.file=non_existent_cache.json"
})
public class ConcordiaControllerTests {

    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_BLACK = "\u001B[30m";
    public static final String ANSI_RED = "\u001B[31m";
    public static final String ANSI_GREEN = "\u001B[32m";
    public static final String ANSI_YELLOW = "\u001B[33m";
    public static final String ANSI_BLUE = "\u001B[34m";
    public static final String ANSI_PURPLE = "\u001B[35m";
    public static final String ANSI_CYAN = "\u001B[36m";
    public static final String ANSI_WHITE = "\u001B[37m";

    @LocalServerPort
    private int port;

    @Autowired
    private RestTemplate restTemplate;

    @BeforeEach
    @AfterEach
    public void cleanup() {
        File file = new File("non_existent_cache.json");
        if (file.exists()) {
            file.delete();
        }
    }

    @Test
    public void getBuildingList_ReturnsBuildingList() {
        // Arrange
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

        String jsonResponse = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":null,\"Latitude\":null,\"Longitude\":null}]";

        mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(jsonResponse, MediaType.APPLICATION_JSON));

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/facilities/buildinglist";
        ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());

        Building[] buildings = response.getBody();
        assertEquals(1, buildings.length);
        assertEquals("SGW", buildings[0].getCampus());
        assertEquals("H", buildings[0].getBuildingCode());
        assertEquals("Hall Building", buildings[0].getBuildingName());
        assertEquals("Henry F. Hall Building", buildings[0].getBuildingLongName());

        mockServer.verify();
    }

    @Test
    public void getBuildingList_WithCoordinates_EnrichesWithGoogleData() throws Exception {
        // Arrange
        MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

        // 1. Concordia API Response with Lat/Long
        String concordiaJson = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

        mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

        // 2. Google API Response
        // Note: The logic in ConcordiaController calls GoogleMapsService which calls
        // the API.

        String googleJson = "{\n" +
                "  \"destinations\": [\n" +
                "    {\n" +
                "      \"primary\": {\n" +
                "        \"place\": \"places/ChIJPlaceId\",\n" +
                "        \"displayName\": { \"text\": \"Hall Building\", \"languageCode\": \"en\" },\n" +
                "        \"formattedAddress\": \"1455 De Maisonneuve Blvd W, Montreal\"\n" +
                "      }\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));

        // Act
        RestTemplate client = new RestTemplate();
        String url = "http://localhost:" + port + "/api/facilities/buildinglist";
        ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());

        Building[] buildings = response.getBody();
        assertNotNull(buildings);
        assertEquals(1, buildings.length);
        assertEquals("SGW", buildings[0].getCampus());
        assertEquals("H", buildings[0].getBuildingCode());

        // Verify Google info was populated
        assertNotNull(buildings[0].getGooglePlaceInfo());
        assertEquals("places/ChIJPlaceId", buildings[0].getGooglePlaceInfo().getPlaceId());
        assertEquals("1455 De Maisonneuve Blvd W, Montreal", buildings[0].getGooglePlaceInfo().getFormattedAddress());
        System.out.println(ANSI_GREEN + "Google Place Info: " + buildings[0].getGooglePlaceInfo() + ANSI_RESET);
        System.out.println(ANSI_GREEN + buildings[0].getGooglePlaceInfo().getDisplayPolygon() + ANSI_RESET);

        mockServer.verify();
    }
}
