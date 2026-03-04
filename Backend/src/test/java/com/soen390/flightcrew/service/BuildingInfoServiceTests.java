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

        assertEquals("N/A", result);
        server.verify();
    }

    @Test
    public void testFetchAccessibilityInfo_NullCode() {
        RestTemplate restTemplate = new RestTemplate();
        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode(null);

        String result = service.fetchAccessibilityInfo(building);
        assertNull(result);
    }

    @Test
    public void testFetchAccessibilityInfo_EmptyCode() {
        RestTemplate restTemplate = new RestTemplate();
        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("");

        String result = service.fetchAccessibilityInfo(building);
        assertNull(result);
    }

    @Test
    public void testFetchAccessibilityInfo_ComplexTraverse() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        String html = "<div>" +
                "<div><h2>Building accessibility</h2></div>" +
                "</div>" +
                "<div>" +
                "<p>Complex info found.</p>" +
                "</div>";

        server.expect(requestTo("https://www.concordia.ca/maps/buildings/H.html"))
                .andRespond(withSuccess(html, MediaType.TEXT_HTML));

        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("H");

        String result = service.fetchAccessibilityInfo(building);
        assertNotNull(result);
        assertTrue(result.contains("Complex info found."));
        server.verify();
    }

    @Test
    public void testFetchAccessibilityInfo_TextImage() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        String html = "<h2>Building accessibility</h2>" +
                "<div class='c-textimage'>" +
                "<b>Title</b> Description" +
                "</div>";

        server.expect(requestTo("https://www.concordia.ca/maps/buildings/H.html"))
                .andRespond(withSuccess(html, MediaType.TEXT_HTML));

        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("H");

        String result = service.fetchAccessibilityInfo(building);
        assertTrue(result.contains("Title: Description"));
        server.verify();
    }

    @Test
    public void testFetchAccessibilityInfo_TextImageNoBold() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        String html = "<h2>Building accessibility</h2>" +
                "<div class='c-textimage'>" +
                "Just text description" +
                "</div>";

        server.expect(requestTo("https://www.concordia.ca/maps/buildings/H.html"))
                .andRespond(withSuccess(html, MediaType.TEXT_HTML));

        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("H");

        String result = service.fetchAccessibilityInfo(building);
        assertTrue(result.contains("Just text description"));
        server.verify();
    }

    @Test
    public void testFetchAccessibilityInfo_StopAtNextHeader() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        String html = "<h2>Building accessibility</h2>" +
                "<p>Info 1</p>" +
                "<h2>Next Section</h2>" +
                "<p>Info 2</p>";

        server.expect(requestTo("https://www.concordia.ca/maps/buildings/H.html"))
                .andRespond(withSuccess(html, MediaType.TEXT_HTML));

        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("H");

        String result = service.fetchAccessibilityInfo(building);
        assertTrue(result.contains("Info 1"));
        assertFalse(result.contains("Info 2"));
        server.verify();
    }

    @Test
    public void testFetchAccessibilityInfo_Exception() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        server.expect(requestTo("https://www.concordia.ca/maps/buildings/H.html"))
                .andRespond((request) -> {
                    throw new RuntimeException("Network error");
                });

        BuildingInfoService service = new BuildingInfoService(restTemplate);
        Building building = new Building();
        building.setBuildingCode("H");

        String result = service.fetchAccessibilityInfo(building);
        assertEquals("N/A", result);
        server.verify();
    }
}
