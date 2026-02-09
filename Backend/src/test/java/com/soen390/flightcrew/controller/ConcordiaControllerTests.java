package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.Building;
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
  void cleanup() {
    File file = new File("non_existent_cache.json");
    if (file.exists()) {
      file.delete();
    }
  }

  @Test
  void getBuildingList_ReturnsBuildingList() {
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
  void getBuildingList_WithCoordinates_EnrichesWithGoogleData() throws Exception {
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

    String googleJson = """
        {
          "destinations": [
            {
              "primary": {
                "place": "places/ChIJPlaceId",
                "displayName": { "text": "Hall Building", "languageCode": "en" },
                "formattedAddress": "1455 De Maisonneuve Blvd W, Montreal"
              }
            }
          ]
        }""";

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
    assertEquals("1455 De Maisonneuve Blvd W, Montreal",
        buildings[0].getGooglePlaceInfo().getFormattedAddress());
    System.out.println(ANSI_GREEN + "Google Place Info: " + buildings[0].getGooglePlaceInfo() + ANSI_RESET);
    System.out.println(ANSI_GREEN + buildings[0].getGooglePlaceInfo().getDisplayPolygon() + ANSI_RESET);

    mockServer.verify();
  }

  @Test
  void getBuildingList_ReturnsCachedData_WhenCacheExists() throws Exception {
    // Arrange — write a valid cache file before hitting the endpoint
    String cachedJson = "[{\"Campus\":\"LOY\",\"Building\":\"AD\",\"Building_Name\":\"AD Building\",\"Building_Long_Name\":\"Administration Building\",\"Address\":\"7141 Sherbrooke\",\"Latitude\":45.458,\"Longitude\":-73.640}]";
    try (FileWriter fw = new FileWriter("non_existent_cache.json")) {
      fw.write(cachedJson);
    }

    // No mock server setup — the external API should NOT be called

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(1, buildings.length);
    assertEquals("LOY", buildings[0].getCampus());
    assertEquals("AD", buildings[0].getBuildingCode());
    assertEquals("Administration Building", buildings[0].getBuildingLongName());
  }

  @Test
  void getBuildingList_IgnoresCorruptCache_AndFetchesFromApi() throws Exception {
    // Arrange — write an invalid JSON cache file
    try (FileWriter fw = new FileWriter("non_existent_cache.json")) {
      fw.write("{{{INVALID JSON###");
    }

    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String jsonResponse = "[{\"Campus\":\"SGW\",\"Building\":\"EV\",\"Building_Name\":\"EV Building\",\"Building_Long_Name\":\"Engineering & Visual Arts\",\"Address\":null,\"Latitude\":null,\"Longitude\":null}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(jsonResponse, MediaType.APPLICATION_JSON));

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — should fall through to API call
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(1, buildings.length);
    assertEquals("EV", buildings[0].getBuildingCode());

    mockServer.verify();
  }

  @Test
  void getBuildingList_ApiError_ReturnsEmptyList() {
    // Arrange
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withServerError());

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — controller catches RestClientException and returns emptyList
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(0, buildings.length);

    mockServer.verify();
  }

  @Test
  void getBuildingList_EmptyResponseFromApi_ReturnsEmptyList() {
    // Arrange
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(0, buildings.length);

    mockServer.verify();
  }

  @Test
  void getBuildingList_BuildingWithoutAddress_SkipsGoogleEnrichment() {
    // Arrange — building has lat/long but no address => enrichWithGoogleData skips
    // it
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String jsonResponse = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":null,\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(jsonResponse, MediaType.APPLICATION_JSON));

    // No Google API mock — it should never be called

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(1, buildings.length);
    assertNull(buildings[0].getGooglePlaceInfo());

    mockServer.verify();
  }

  @Test
  void getBuildingList_GoogleApiReturnsEmptyDestinations_NoEnrichment() {
    // Arrange
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String concordiaJson = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

    // Google returns empty destinations
    String googleJson = "{\"destinations\": []}";

    mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — enrichBuilding early-returns, googlePlaceInfo stays null
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(1, buildings.length);
    assertNull(buildings[0].getGooglePlaceInfo());

    mockServer.verify();
  }

  @Test
  void getBuildingList_GoogleApiError_BuildingStillReturned() {
    // Arrange
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String concordiaJson = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

    // Google API returns server error
    mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withServerError());

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — building returned without google info, no exception bubbles up
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(1, buildings.length);
    assertEquals("H", buildings[0].getBuildingCode());
    assertNull(buildings[0].getGooglePlaceInfo());

    mockServer.verify();
  }

  @Test
  void getBuildingList_MultipleBuildings_OnlyBuildingsWithAddressEnriched() {
    // Arrange
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    // Two buildings: one with address, one without
    String concordiaJson = "[" +
        "{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790},"
        +
        "{\"Campus\":\"LOY\",\"Building\":\"SP\",\"Building_Name\":\"SP Building\",\"Building_Long_Name\":\"Richard J. Renaud Science Complex\",\"Address\":null,\"Latitude\":null,\"Longitude\":null}"
        +
        "]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

    // Only one Google call expected (for H building with address)
    String googleJson = """
        {
          "destinations": [
            {
              "primary": {
                "place": "places/ChIJHall",
                "displayName": { "text": "Henry F. Hall Building", "languageCode": "en" },
                "formattedAddress": "1455 De Maisonneuve Blvd W, Montreal"
              }
            }
          ]
        }""";

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
    assertEquals(2, buildings.length);

    // H building should be enriched
    assertNotNull(buildings[0].getGooglePlaceInfo());
    assertEquals("places/ChIJHall", buildings[0].getGooglePlaceInfo().getPlaceId());

    // SP building should NOT be enriched
    assertNull(buildings[1].getGooglePlaceInfo());

    mockServer.verify();
  }

  @Test
  void getBuildingList_MultipleDestinations_FindsBestMatch() {
    // Arrange — Google returns multiple destinations, controller should pick the
    // best match
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String concordiaJson = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

    // Google returns multiple destinations — second one matches the building long
    // name
    String googleJson = """
        {
          "destinations": [
            {
              "primary": {
                "place": "places/WrongPlace",
                "displayName": { "text": "Some Other Building", "languageCode": "en" },
                "formattedAddress": "999 Random St"
              }
            },
            {
              "primary": {
                "place": "places/CorrectPlace",
                "displayName": { "text": "Henry F. Hall Building", "languageCode": "en" },
                "formattedAddress": "1455 De Maisonneuve Blvd W, Montreal"
              }
            }
          ]
        }""";

    mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — should pick the second destination as the best match
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(1, buildings.length);
    assertNotNull(buildings[0].getGooglePlaceInfo());
    assertEquals("places/CorrectPlace", buildings[0].getGooglePlaceInfo().getPlaceId());
    assertEquals("1455 De Maisonneuve Blvd W, Montreal",
        buildings[0].getGooglePlaceInfo().getFormattedAddress());

    mockServer.verify();
  }

  @Test
  void getBuildingList_NoMatchingDestinationName_ReturnsFirstDestination() {
    // Arrange — Google returns destinations where none match the building name
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String concordiaJson = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

    String googleJson = """
        {
          "destinations": [
            {
              "primary": {
                "place": "places/FirstPlace",
                "displayName": { "text": "Unrelated Name", "languageCode": "en" },
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

    mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — falls back to first destination
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertEquals(1, buildings.length);
    assertNotNull(buildings[0].getGooglePlaceInfo());
    assertEquals("places/FirstPlace", buildings[0].getGooglePlaceInfo().getPlaceId());

    mockServer.verify();
  }

  @Test
  void getBuildingList_BuildingWithNullLongName_UsesShortNameForMatching() {
    // Arrange — Building_Long_Name is null, should fall back to Building_Name for
    // matching
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String concordiaJson = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":null,\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

    String googleJson = """
        {
          "destinations": [
            {
              "primary": {
                "place": "places/WrongPlace",
                "displayName": { "text": "Unrelated", "languageCode": "en" },
                "formattedAddress": "Some Address"
              }
            },
            {
              "primary": {
                "place": "places/CorrectPlace",
                "displayName": { "text": "Hall Building", "languageCode": "en" },
                "formattedAddress": "1455 De Maisonneuve Blvd W"
              }
            }
          ]
        }""";

    mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — matched on "Hall Building" (short name) since long name is null
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertNotNull(buildings[0].getGooglePlaceInfo());
    assertEquals("places/CorrectPlace", buildings[0].getGooglePlaceInfo().getPlaceId());

    mockServer.verify();
  }

  @Test
  void getBuildingList_CacheWrittenAfterApiFetch_SubsequentCallUsesCache() {
    // Arrange — first call fetches from API and writes cache
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String jsonResponse = "[{\"Campus\":\"SGW\",\"Building\":\"MB\",\"Building_Name\":\"MB Building\",\"Building_Long_Name\":\"John Molson Building\",\"Address\":null,\"Latitude\":null,\"Longitude\":null}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(jsonResponse, MediaType.APPLICATION_JSON));

    // Act — first call
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(1, response.getBody().length);
    assertEquals("MB", response.getBody()[0].getBuildingCode());

    // Verify cache file was created
    File cacheFile = new File("non_existent_cache.json");
    assertTrue(cacheFile.exists(), "Cache file should have been created after API fetch");

    mockServer.verify();
  }

  @Test
  void getBuildingList_DestinationWithNullPrimary_SkipsInMatching() {
    // Arrange — one destination has null primary, should be skipped in
    // findBestMatch
    MockRestServiceServer mockServer = MockRestServiceServer.bindTo(restTemplate).build();

    String concordiaJson = "[{\"Campus\":\"SGW\",\"Building\":\"H\",\"Building_Name\":\"Hall Building\",\"Building_Long_Name\":\"Henry F. Hall Building\",\"Address\":\"1455 De Maisonneuve\",\"Latitude\":45.4972,\"Longitude\":-73.5790}]";

    mockServer.expect(requestTo("http://mock-api.com/facilities/buildinglist/"))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(concordiaJson, MediaType.APPLICATION_JSON));

    // First destination has null displayName in primary, second has valid match
    String googleJson = """
        {
          "destinations": [
            {
              "primary": {
                "place": "places/First",
                "formattedAddress": "Some Address"
              }
            },
            {
              "primary": {
                "place": "places/MatchPlace",
                "displayName": { "text": "Henry F. Hall Building", "languageCode": "en" },
                "formattedAddress": "1455 De Maisonneuve Blvd W"
              }
            }
          ]
        }""";

    mockServer.expect(requestTo("https://geocode.googleapis.com/v4alpha/geocode/destinations"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withSuccess(googleJson, MediaType.APPLICATION_JSON));

    // Act
    RestTemplate client = new RestTemplate();
    String url = "http://localhost:" + port + "/api/facilities/buildinglist";
    ResponseEntity<Building[]> response = client.getForEntity(url, Building[].class);

    // Assert — should skip first (null displayName) and match second
    assertEquals(HttpStatus.OK, response.getStatusCode());
    Building[] buildings = response.getBody();
    assertNotNull(buildings);
    assertNotNull(buildings[0].getGooglePlaceInfo());
    assertEquals("places/MatchPlace", buildings[0].getGooglePlaceInfo().getPlaceId());

    mockServer.verify();
  }
}
