package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.IndoorAssetFileDTO;
import com.soen390.flightcrew.model.IndoorNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.spy;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class IndoorNavigationDataServiceTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final IndoorNavigationDataService indoorNavigationDataService = spy(new IndoorNavigationDataService(
            objectMapper,
            "src/test/resources/indoor/json", "src/test/resources/indoor/svg"));

    @Test
    void testDetectAssetContentTypeReturnsProbeResultWhenPresent() throws IOException {
        doReturn("application/pdf").when(indoorNavigationDataService)
                .probeContentType(Path.of("src/test/resources/indoor/svg/document.pdf"));

        String contentType = indoorNavigationDataService.detectAssetContentType("document.pdf");

        assertEquals("application/pdf", contentType);
    }

    @Test
    void testDetectAssetContentTypeFallsBackToExtensionWhenProbeReturnsNull() throws IOException {
        doReturn(null).when(indoorNavigationDataService)
                .probeContentType(Path.of("src/test/resources/indoor/svg/map.png"));

        String contentType = indoorNavigationDataService.detectAssetContentType("map.png");

        assertEquals("image/png", contentType);

        doReturn(null).when(indoorNavigationDataService)
                .probeContentType(Path.of("src/test/resources/indoor/svg/floor1.jpg"));
        contentType = indoorNavigationDataService.detectAssetContentType("floor1.jpg");
        assertEquals("image/jpeg", contentType);

        doReturn(null).when(indoorNavigationDataService)
                .probeContentType(Path.of("src/test/resources/indoor/svg/floor1.webp"));
        contentType = indoorNavigationDataService.detectAssetContentType("floor1.webp");
        assertEquals("image/webp", contentType);
    }

    @Test
    void testDetectAssetContentTypeFallsBackWhenProbeThrows() throws IOException {
        doThrow(new IOException("probe failed")).when(indoorNavigationDataService)
                .probeContentType(Path.of("src/test/resources/indoor/svg/floor1.svg"));

        String contentType = indoorNavigationDataService.detectAssetContentType("floor1.svg");

        assertEquals("image/svg+xml", contentType);
    }

    @Test
    void testDetectAssetContentTypeReturnsOctetStreamForUnknownExtension() throws IOException {
        doReturn(null).when(indoorNavigationDataService)
                .probeContentType(Path.of("src/test/resources/indoor/svg/archive.bin"));

        String contentType = indoorNavigationDataService.detectAssetContentType("archive.bin");

        assertEquals("application/octet-stream", contentType);
    }

    @Test
    void testGetAvailableBuildings(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(jsonDir.resolve("one.json"),
                """
                        {
                          "meta": {"buildingId": "H"},
                          "nodes": []
                        }
                        """);
        Files.writeString(jsonDir.resolve("two.json"),
                """
                        {
                          "meta": {"buildingId": "MB"},
                          "nodes": []
                        }
                        """);
        Files.writeString(jsonDir.resolve("three.json"),
                """
                        {
                          "meta": {"buildingId": "H"},
                          "nodes": []
                        }
                        """);
        Files.writeString(jsonDir.resolve("ignored-missing-id.json"),
                """
                        {
                          "meta": {},
                          "nodes": []
                        }
                        """);
        Files.writeString(jsonDir.resolve("ignored-missing-meta.json"),
                """
                        {
                          "nodes": []
                        }
                        """);

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        List<String> buildings = service.getAvailableBuildings();

        assertEquals(List.of("H", "MB"), buildings);
    }

    @Test
    void testGetFloorsByBuilding(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(jsonDir.resolve("nodes.json"),
                """
                        {
                                "meta": {"buildingId": "H"},
                                "nodes": [
                                        {"id": "n1", "type": "room", "buildingId": "H", "floor": 2, "label": "H-201"},
                                        {"id": "n2", "type": "room", "buildingId": "h", "floor": 1, "label": "H-101"},
                                        {"id": "n3", "type": "hall", "buildingId": "H", "floor": 2, "label": "Hall"},
                                        {"id": "n4", "type": "room", "buildingId": "H", "floor": null, "label": "No floor"},
                                        {"id": "n5", "type": "room", "buildingId": "MB", "floor": 3, "label": "MB-301"}
                                ]
                        }
                        """);

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        assertEquals(List.of(1, 2), service.getFloorsByBuilding("H"));
        assertEquals(List.of(1, 2), service.getFloorsByBuilding("h"));
        assertEquals(List.of(), service.getFloorsByBuilding(""));
        assertEquals(List.of(), service.getFloorsByBuilding(null));
        assertEquals(List.of(), service.getFloorsByBuilding("VL"));
    }

    @Test
    void testGetRooms(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(jsonDir.resolve("rooms.json"),
                """
                        {
                          "meta": {"buildingId": "H"},
                          "nodes": [
                            {"id": "r1", "type": "room", "buildingId": "H", "floor": 2, "label": "Lab Alpha"},
                            {"id": "r2", "type": "room", "buildingId": "H", "floor": 2, "label": "Classroom"},
                            {"id": "r3", "type": "room", "buildingId": "MB", "floor": 2, "label": "Lab Beta"},
                            {"id": "r4", "type": "room", "buildingId": "H", "floor": 1, "label": "Lab Ground"},
                            {"id": "n1", "type": "hall", "buildingId": "H", "floor": 2, "label": "Lab Hall"}
                          ]
                        }
                        """);

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        List<String> filteredLabels = service.getRooms("  lab ", "h", 2).stream()
                .map(IndoorNode::getLabel)
                .toList();
        List<String> allRoomLabels = service.getRooms("", null, null).stream()
                .map(IndoorNode::getLabel)
                .toList();

        assertEquals(List.of("Lab Alpha"), filteredLabels);
        assertEquals(List.of("Classroom", "Lab Alpha", "Lab Beta", "Lab Ground"), allRoomLabels);
    }

    @Test
    void testListSvgAssets(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(svgDir.resolve("a.svg"), "<svg></svg>");
        Files.writeString(svgDir.resolve("b.svg"), "<svg></svg>");
        Files.writeString(svgDir.resolve("ignore.png"), "png");
        Files.createDirectory(svgDir.resolve("nested"));
        Files.writeString(svgDir.resolve("nested").resolve("nested.svg"), "<svg></svg>");

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        List<IndoorAssetFileDTO> assets = service.listSvgAssets();

        assertEquals(List.of(
                new IndoorAssetFileDTO("a.svg", "/api/indoor/assets/svg/a.svg"),
                new IndoorAssetFileDTO("b.svg", "/api/indoor/assets/svg/b.svg")), assets);
    }

    @Test
    void testListSvgAssetsReturnsEmptyWhenDirectoryMissing(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = tempDir.resolve("svg");
        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());
        List<IndoorAssetFileDTO> assets = service.listSvgAssets();
        assertTrue(assets.isEmpty());
    }

    @Test
    void testLoadAssetFile(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(svgDir.resolve("floor1.svg"), "<svg id=\"floor1\"></svg>");

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        Resource resource = service.loadAssetFile("floor1.svg");
        ResponseStatusException invalidPathException = assertThrows(ResponseStatusException.class,
                () -> service.loadAssetFile("../secret.svg"));
        ResponseStatusException missingFileException = assertThrows(ResponseStatusException.class,
                () -> service.loadAssetFile("does-not-exist-123.svg"));

        assertTrue(resource.exists());
        assertEquals("floor1.svg", resource.getFilename());
        assertEquals(HttpStatus.BAD_REQUEST, invalidPathException.getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, missingFileException.getStatusCode());
    }

    @Test
    void testLoadAssetFileBadRequest(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        assertThrows(ResponseStatusException.class, () -> service.loadAssetFile("../secret.svg"));
        assertThrows(ResponseStatusException.class, () -> service.loadAssetFile("nested/secret.svg"));
        assertThrows(ResponseStatusException.class, () -> service.loadAssetFile("nested\\secret.svg"));
        assertThrows(ResponseStatusException.class, () -> service.loadAssetFile(""));
        assertThrows(ResponseStatusException.class, () -> service.loadAssetFile("   "));
        assertThrows(ResponseStatusException.class, () -> service.loadAssetFile(null));
    }

    @Test
    void testLoadSvgFile(@TempDir Path tempDir) throws IOException {
        Path jsonDir = Files.createDirectory(tempDir.resolve("json"));
        Path svgDir = Files.createDirectory(tempDir.resolve("svg"));

        Files.writeString(svgDir.resolve("map.svg"), "<svg id=\"map\"></svg>");

        IndoorNavigationDataService service = new IndoorNavigationDataService(
                objectMapper,
                jsonDir.toString(),
                svgDir.toString());

        Resource resource = service.loadSvgFile("map.svg");

        assertTrue(resource.exists());
        assertEquals("map.svg", resource.getFilename());
    }
}
