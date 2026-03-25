package com.soen390.flightcrew.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soen390.flightcrew.model.IndoorEdge;
import com.soen390.flightcrew.model.IndoorNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class IndoorNavigationDataServiceExtraTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testGetAllNodes(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(jsonDir.resolve("nodes.json"),
                """
                        {
                                "meta": {"buildingId": "H"},
                                "nodes": [
                                        {"id": "n1", "type": "room", "buildingId": "H", "floor": 2, "label": "H-201"},
                                        {"id": "n2", "type": "room", "buildingId": "MB", "floor": 1, "label": "MB-101"}
                                ]
                        }
                        """);

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        List<IndoorNode> hNodes = service.getAllNodes("H");
        assertEquals(1, hNodes.size());
        assertEquals("n1", hNodes.get(0).getId());

        List<IndoorNode> allNodes = service.getAllNodes(null);
        assertEquals(2, allNodes.size());
    }

    @Test
    void testGetEdgesByBuilding(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(jsonDir.resolve("edges.json"),
                """
                        {
                                "meta": {"buildingId": "H"},
                                "edges": [
                                        {"source": "n1", "target": "n2", "weight": 5}
                                ]
                        }
                        """);

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        List<IndoorEdge> hEdges = service.getEdgesByBuilding("H");
        assertEquals(1, hEdges.size());
        assertEquals("n1", hEdges.get(0).getSource());

        List<IndoorEdge> emptyEdges = service.getEdgesByBuilding("");
        assertEquals(0, emptyEdges.size());
    }

    @Test
    void testParseBuildingDataException(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        // Invalid JSON to trigger Jackson parsing exception
        Files.writeString(jsonDir.resolve("invalid.json"), "{ invalid json ");

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        assertThrows(ResponseStatusException.class, service::getAvailableBuildings);
    }
}
