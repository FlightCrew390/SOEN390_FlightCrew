package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.Building;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "external.api.url=http://mock-api.com",
        "external.api.user=testUser",
        "external.api.key=testKey"
})
public class ConcordiaControllerTests {

    @LocalServerPort
    private int port;

    @Autowired
    private RestTemplate restTemplate;

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
}
