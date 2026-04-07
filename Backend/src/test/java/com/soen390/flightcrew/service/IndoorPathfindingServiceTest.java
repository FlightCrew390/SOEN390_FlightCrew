package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.IndoorEdge;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class IndoorPathfindingServiceTest {

    @Mock
    private IndoorNavigationDataService dataService;

    private IndoorPathfindingService pathfindingService;

    @BeforeEach
    public void setup() {
        pathfindingService = new IndoorPathfindingService(dataService);
    }

    @Test
    public void testFindShortestPath_SimpleGraph() {
        IndoorEdge edge1 = new IndoorEdge();
        edge1.setSource("A");
        edge1.setTarget("B");
        edge1.setWeight(10);
        edge1.setAccessible(true);

        IndoorEdge edge2 = new IndoorEdge();
        edge2.setSource("B");
        edge2.setTarget("C");
        edge2.setWeight(20);
        edge2.setAccessible(true);

        when(dataService.getEdgesByBuilding(anyString())).thenReturn(Arrays.asList(edge1, edge2));

        List<String> path = pathfindingService.findShortestPath("building1", "A", "C", false);

        assertNotNull(path);
        assertEquals(3, path.size());
        assertEquals("A", path.get(0));
        assertEquals("B", path.get(1));
        assertEquals("C", path.get(2));
    }

    @Test
    public void testFindShortestPath_AccessibleRequired_SkipInaccessible() {
        IndoorEdge edge1 = new IndoorEdge();
        edge1.setSource("A");
        edge1.setTarget("B");
        edge1.setWeight(10);
        edge1.setAccessible(false);

        IndoorEdge edge2 = new IndoorEdge();
        edge2.setSource("A");
        edge2.setTarget("C");
        edge2.setWeight(30);
        edge2.setAccessible(true);

        IndoorEdge edge3 = new IndoorEdge();
        edge3.setSource("C");
        edge3.setTarget("B");
        edge3.setWeight(10);
        edge3.setAccessible(true);

        when(dataService.getEdgesByBuilding(anyString())).thenReturn(Arrays.asList(edge1, edge2, edge3));

        // When accessible is required, it should go A -> C -> B (weight 40)
        // instead of A -> B (weight 10, inaccessible)
        List<String> path = pathfindingService.findShortestPath("building1", "A", "B", true);

        assertNotNull(path);
        assertEquals(3, path.size());
        assertEquals(Arrays.asList("A", "C", "B"), path);
    }

    @Test
    public void testFindShortestPath_StartNodeNotInGraph() {
        when(dataService.getEdgesByBuilding(anyString())).thenReturn(Collections.emptyList());
        List<String> path = pathfindingService.findShortestPath("building1", "Z", "X", false);
        assertTrue(path.isEmpty());
    }

    @Test
    public void testFindShortestPath_StairEdge_SkippedWhenAccessibleRequired() {
        // Stair edge (direct, but inaccessible)
        IndoorEdge stairEdge = new IndoorEdge();
        stairEdge.setSource("F1_hall");
        stairEdge.setTarget("F2_hall");
        stairEdge.setType("stair");
        stairEdge.setWeight(10);
        stairEdge.setAccessible(false);

        // Elevator path: F1_hall -> F1_elevator -> F2_elevator -> F2_hall
        IndoorEdge toElevatorF1 = new IndoorEdge();
        toElevatorF1.setSource("F1_hall");
        toElevatorF1.setTarget("F1_elevator");
        toElevatorF1.setWeight(5);
        toElevatorF1.setAccessible(true);

        IndoorEdge elevatorEdge = new IndoorEdge();
        elevatorEdge.setSource("F1_elevator");
        elevatorEdge.setTarget("F2_elevator");
        elevatorEdge.setType("elevator");
        elevatorEdge.setWeight(15);
        elevatorEdge.setAccessible(true);

        IndoorEdge fromElevatorF2 = new IndoorEdge();
        fromElevatorF2.setSource("F2_elevator");
        fromElevatorF2.setTarget("F2_hall");
        fromElevatorF2.setWeight(5);
        fromElevatorF2.setAccessible(true);

        when(dataService.getEdgesByBuilding(anyString()))
                .thenReturn(Arrays.asList(stairEdge, toElevatorF1, elevatorEdge, fromElevatorF2));

        List<String> path = pathfindingService.findShortestPath("building1", "F1_hall", "F2_hall", true);

        assertNotNull(path);
        assertFalse(path.isEmpty(), "Accessible path should exist via elevator");
        assertFalse(path.contains("F2_hall") && path.size() == 2,
                "Path must not be the direct stair route");
        assertTrue(path.contains("F1_elevator") && path.contains("F2_elevator"),
                "Accessible path should route through elevator");
    }

    @Test
    public void testFindShortestPath_TargetUnreachable() {
        IndoorEdge edge1 = new IndoorEdge();
        edge1.setSource("A");
        edge1.setTarget("B");
        edge1.setWeight(10);
        edge1.setAccessible(true);

        IndoorEdge edge2 = new IndoorEdge();
        edge2.setSource("C");
        edge2.setTarget("D");
        edge2.setWeight(10);
        edge2.setAccessible(true);

        when(dataService.getEdgesByBuilding(anyString())).thenReturn(Arrays.asList(edge1, edge2));

        List<String> path = pathfindingService.findShortestPath("building1", "A", "C", false);
        assertTrue(path.isEmpty());
    }
}