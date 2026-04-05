package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.model.IndoorAssetFileDTO;
import com.soen390.flightcrew.model.IndoorStep;
import com.soen390.flightcrew.service.IndoorNavigationDataService;
import com.soen390.flightcrew.service.IndoorPathfindingService;
import com.soen390.flightcrew.service.IndoorStepGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class IndoorControllerRealApiTests {

    @Mock
    private IndoorNavigationDataService dataService;

    @Mock
    private IndoorPathfindingService pathfindingService;

    @Mock
    private IndoorStepGeneratorService stepGeneratorService;

    private IndoorController controller;

    @BeforeEach
    public void setup() {
        controller = new IndoorController(dataService, pathfindingService, stepGeneratorService, null);
    }

    @Test
    public void testGetAvailableBuildings() {
        when(dataService.getAvailableBuildings()).thenReturn(Arrays.asList("H", "MB"));
        ResponseEntity<List<String>> response = controller.getAvailableBuildings();
        assertEquals(200, response.getStatusCode().value());
        assertEquals(2, response.getBody().size());
    }

    @Test
    public void testGetFloorsByBuilding() {
        when(dataService.getFloorsByBuilding("H")).thenReturn(Arrays.asList(1, 8, 9));
        ResponseEntity<List<Integer>> response = controller.getFloorsByBuilding("H");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(3, response.getBody().size());
    }

    @Test
    public void testGetRooms() {
        IndoorNode room = new IndoorNode();
        room.setId("H-820");
        when(dataService.getRooms(anyString(), anyString(), any(Integer.class)))
                .thenReturn(Collections.singletonList(room));
        ResponseEntity<List<IndoorNode>> response = controller.getRooms("820", "H", 8);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
    }

    @Test
    public void testGetNodes() {
        IndoorNode node = new IndoorNode();
        node.setId("node1");
        when(dataService.getAllNodes(anyString())).thenReturn(Collections.singletonList(node));
        ResponseEntity<List<IndoorNode>> response = controller.getNodes("H");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
    }

    @Test
    public void testListSvgAssets() {
        IndoorAssetFileDTO dto = new IndoorAssetFileDTO("test.svg", "url");
        when(dataService.listSvgAssets()).thenReturn(Collections.singletonList(dto));
        ResponseEntity<List<IndoorAssetFileDTO>> response = controller.listSvgAssets();
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
    }

    @Test
    public void testGetSvgFile() {
        Resource resource = new ByteArrayResource("<svg></svg>".getBytes());
        when(dataService.loadSvgFile("test.svg")).thenReturn(resource);
        ResponseEntity<Resource> response = controller.getSvgFile("test.svg");
        assertEquals(200, response.getStatusCode().value());
        assertEquals("image/svg+xml", response.getHeaders().getContentType().toString());
    }

    @Test
    public void testGetAssetFile() {
        Resource resource = new ByteArrayResource("data".getBytes());
        when(dataService.loadAssetFile("test.png")).thenReturn(resource);
        when(dataService.detectAssetContentType("test.png")).thenReturn("image/png");
        ResponseEntity<Resource> response = controller.getAssetFile("test.png");
        assertEquals(200, response.getStatusCode().value());
        assertEquals("image/png", response.getHeaders().getContentType().toString());
    }

    @Test
    public void testGetIndoorDirections_Success() {
        IndoorNode node1 = new IndoorNode();
        node1.setId("A");
        IndoorNode node2 = new IndoorNode();
        node2.setId("B");

        when(pathfindingService.findShortestPath("H", "A", "B", false)).thenReturn(Arrays.asList("A", "B"));
        when(dataService.getAllNodes("H")).thenReturn(Arrays.asList(node1, node2));

        IndoorStep step = new IndoorStep("Walk to B", "front", 10.0, 5, 1, 1, "A", "B");
        when(dataService.getEdgesByBuilding("H")).thenReturn(Collections.emptyList());
        when(stepGeneratorService.generateSteps(any(), any())).thenReturn(Collections.singletonList(step));

        ResponseEntity<Object> response = (ResponseEntity<Object>) controller.getIndoorDirections("H", "A", "B", false);
        assertEquals(200, response.getStatusCode().value());

        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body.get("path"));
        assertNotNull(body.get("steps"));
        assertEquals(10.0, body.get("distanceMeters"));
        assertEquals(5, body.get("durationSeconds"));
    }

    @Test
    public void testGetIndoorDirections_NotFound() {
        when(pathfindingService.findShortestPath("H", "A", "B", false)).thenReturn(Collections.emptyList());
        ResponseEntity<Object> response = controller.getIndoorDirections("H", "A", "B", false);
        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    public void testGetIndoorDirections_Exception() {
        when(pathfindingService.findShortestPath("H", "A", "B", false)).thenThrow(new RuntimeException("Test Error"));
        ResponseEntity<Object> response = controller.getIndoorDirections("H", "A", "B", false);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Test Error"));
    }
}
