package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.exception.GlobalExceptionHandler;
import com.soen390.flightcrew.model.IndoorAssetFileDTO;
import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.model.IndoorPointOfInterest;
import com.soen390.flightcrew.service.IndoorNavigationDataService;
import com.soen390.flightcrew.service.IndoorPathfindingService;
import com.soen390.flightcrew.service.IndoorPoiService;
import com.soen390.flightcrew.service.IndoorStepGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class IndoorControllerTest {

    private MockMvc mockMvc;

    @Mock
    private IndoorNavigationDataService indoorNavigationDataService;

    @Mock
    private IndoorPathfindingService pathfindingService;

    @Mock
    private IndoorStepGeneratorService stepGeneratorService;

    @Mock
    private IndoorPoiService indoorPoiService;

    @InjectMocks
    private IndoorController indoorController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(indoorController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/indoor/assets/{fileName} returns requested asset")
    void testGetAssetFile() throws Exception {
        Resource resource = new ByteArrayResource("png-data".getBytes());
        when(indoorNavigationDataService.loadAssetFile("icon.png")).thenReturn(resource);
        when(indoorNavigationDataService.detectAssetContentType("icon.png")).thenReturn("image/png");

        mockMvc.perform(get("/api/indoor/assets/icon.png"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));

        verify(indoorNavigationDataService).loadAssetFile("icon.png");
        verify(indoorNavigationDataService).detectAssetContentType("icon.png");
    }

    @Test
    @DisplayName("GET /api/indoor/buildings returns buildings list")
    void testGetAvailableBuildings() throws Exception {
        when(indoorNavigationDataService.getAvailableBuildings()).thenReturn(List.of("H", "MB"));

        mockMvc.perform(get("/api/indoor/buildings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("H"))
                .andExpect(jsonPath("$[1]").value("MB"));

        verify(indoorNavigationDataService).getAvailableBuildings();
    }

    @Test
    @DisplayName("GET /api/indoor/buildings/{id}/floors returns floors for building")
    void testGetFloorsByBuilding() throws Exception {
        when(indoorNavigationDataService.getFloorsByBuilding("H")).thenReturn(List.of(1, 2, 8));

        mockMvc.perform(get("/api/indoor/buildings/H/floors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value(1))
                .andExpect(jsonPath("$[1]").value(2))
                .andExpect(jsonPath("$[2]").value(8));

        verify(indoorNavigationDataService).getFloorsByBuilding("H");
    }

    @Test
    @DisplayName("GET /api/indoor/rooms forwards optional filters")
    void testGetRooms() throws Exception {
        IndoorNode node = new IndoorNode();
        node.setId("H-820");
        node.setLabel("H-820");
        node.setBuildingId("H");
        node.setFloor(8);
        node.setType("room");

        when(indoorNavigationDataService.getRooms("820", "H", 8)).thenReturn(List.of(node));

        mockMvc.perform(get("/api/indoor/rooms")
                .param("query", "820")
                .param("buildingId", "H")
                .param("floor", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("H-820"))
                .andExpect(jsonPath("$[0].label").value("H-820"))
                .andExpect(jsonPath("$[0].buildingId").value("H"))
                .andExpect(jsonPath("$[0].floor").value(8));

        verify(indoorNavigationDataService).getRooms("820", "H", 8);
    }

    @Test
    @DisplayName("GET /api/indoor/assets/svg/{fileName} returns svg content")
    void testGetSvgFile() throws Exception {
        Resource resource = new ByteArrayResource("<svg/>".getBytes());
        when(indoorNavigationDataService.loadSvgFile("hall.svg")).thenReturn(resource);

        mockMvc.perform(get("/api/indoor/assets/svg/hall.svg"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/svg+xml"));

        verify(indoorNavigationDataService).loadSvgFile("hall.svg");
    }

    @Test
    @DisplayName("GET /api/indoor/assets/svg returns all svg assets")
    void testListSvgAssets() throws Exception {
        List<IndoorAssetFileDTO> assets = List.of(
                new IndoorAssetFileDTO("h8.svg", "/api/indoor/assets/svg/h8.svg"),
                new IndoorAssetFileDTO("mb2.svg", "/api/indoor/assets/svg/mb2.svg"));
        when(indoorNavigationDataService.listSvgAssets()).thenReturn(assets);

        mockMvc.perform(get("/api/indoor/assets/svg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fileName").value("h8.svg"))
                .andExpect(jsonPath("$[0].downloadUrl").value("/api/indoor/assets/svg/h8.svg"))
                .andExpect(jsonPath("$[1].fileName").value("mb2.svg"))
                .andExpect(jsonPath("$[1].downloadUrl").value("/api/indoor/assets/svg/mb2.svg"));

        verify(indoorNavigationDataService).listSvgAssets();
    }

    @Test
    @DisplayName("GET /api/indoor/pois?buildingCode=H returns POIs for building")
    void testGetIndoorPoisForBuilding() throws Exception {
        IndoorPointOfInterest poi1 = new IndoorPointOfInterest();
        poi1.setId("H-washroom-1");
        poi1.setName("Washroom");
        poi1.setCategory("washroom");
        poi1.setBuildingCode("H");
        poi1.setFloor(1);
        poi1.setLatitude(45.49704);
        poi1.setLongitude(-73.57898);
        poi1.setDescription("Near main entrance lobby");
        poi1.setX(1100);
        poi1.setY(1700);

        IndoorPointOfInterest poi2 = new IndoorPointOfInterest();
        poi2.setId("H-fountain-1");
        poi2.setName("Water Fountain");
        poi2.setCategory("fountain");
        poi2.setBuildingCode("H");
        poi2.setFloor(1);
        poi2.setLatitude(45.49698);
        poi2.setLongitude(-73.57889);
        poi2.setDescription("By the main corridor");
        poi2.setX(850);
        poi2.setY(1100);

        when(indoorPoiService.getIndoorPoisForBuilding("H")).thenReturn(List.of(poi1, poi2));

        mockMvc.perform(get("/api/indoor/pois")
                .param("buildingCode", "H"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("H-washroom-1"))
                .andExpect(jsonPath("$[0].name").value("Washroom"))
                .andExpect(jsonPath("$[0].category").value("washroom"))
                .andExpect(jsonPath("$[0].buildingCode").value("H"))
                .andExpect(jsonPath("$[0].floor").value(1))
                .andExpect(jsonPath("$[1].id").value("H-fountain-1"))
                .andExpect(jsonPath("$[1].category").value("fountain"));

        verify(indoorPoiService).getIndoorPoisForBuilding("H");
    }

    @Test
    @DisplayName("GET /api/indoor/pois without parameter returns all POIs")
    void testGetAllIndoorPois() throws Exception {
        IndoorPointOfInterest poi1 = new IndoorPointOfInterest();
        poi1.setId("H-washroom-1");
        poi1.setName("Washroom");
        poi1.setCategory("washroom");
        poi1.setBuildingCode("H");
        poi1.setFloor(1);

        IndoorPointOfInterest poi2 = new IndoorPointOfInterest();
        poi2.setId("MB-washroom-1");
        poi2.setName("Washroom");
        poi2.setCategory("washroom");
        poi2.setBuildingCode("MB");
        poi2.setFloor(1);

        java.util.Map<String, List<IndoorPointOfInterest>> allPois = new java.util.HashMap<>();
        allPois.put("H", List.of(poi1));
        allPois.put("MB", List.of(poi2));

        when(indoorPoiService.getAllIndoorPois()).thenReturn(allPois);

        mockMvc.perform(get("/api/indoor/pois"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[1].id").exists());

        verify(indoorPoiService).getAllIndoorPois();
    }

    @Test
    @DisplayName("GET /api/indoor/pois?buildingCode=UNKNOWN returns empty list")
    void testGetIndoorPoisForUnknownBuilding() throws Exception {
        when(indoorPoiService.getIndoorPoisForBuilding("UNKNOWN")).thenReturn(List.of());

        mockMvc.perform(get("/api/indoor/pois")
                .param("buildingCode", "UNKNOWN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(indoorPoiService).getIndoorPoisForBuilding("UNKNOWN");
    }
}
