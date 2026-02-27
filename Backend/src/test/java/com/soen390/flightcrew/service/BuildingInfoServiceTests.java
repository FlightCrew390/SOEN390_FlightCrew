package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.Building;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class BuildingInfoServiceTests {

    @Test
    public void testFetchAccessibilityInfo_Success() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        server.expect(requestTo("https://www.concordia.ca/maps/buildings/H.html"))
                .andRespond(withSuccess("<html><h2>Building accessibility</h2><p>Wheelchair accessible.</p></html>",
                        MediaType.TEXT_HTML));

        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("H");

        String result = service.fetchAccessibilityInfo(building);

        assertNotNull(result);
        assertEquals("Wheelchair accessible.", result);
        server.verify();
    }

    @Test
    public void testFetchAccessibilityInfo_NotFound() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        // Respond with HTML that doesn't have the accessibility section
        server.expect(requestTo("https://www.concordia.ca/maps/buildings/H.html"))
                .andRespond(withSuccess("<html><body><p>No info here</p></body></html>", MediaType.TEXT_HTML));

        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("H");

        String result = service.fetchAccessibilityInfo(building);

        assertNull(result);
        server.verify();
    }
}
