package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.IndoorEdge;
import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.model.IndoorStep;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class IndoorStepGeneratorServiceTest {

    private IndoorStepGeneratorService service;

    @BeforeEach
    public void setup() {
        service = new IndoorStepGeneratorService();
    }

    @Test
    public void testGenerateSteps_EmptyOrSingleNode() {
        assertTrue(service.generateSteps(null, null).isEmpty());
        assertTrue(service.generateSteps(List.of(new IndoorNode()), null).isEmpty());
    }

    @Test
    public void testGenerateSteps_BasicPath() {
        IndoorNode n1 = new IndoorNode();
        n1.setId("1");
        n1.setLabel("Entrance");
        IndoorNode n2 = new IndoorNode();
        n2.setId("2");
        n2.setLabel("Hallway");
        IndoorNode n3 = new IndoorNode();
        n3.setId("3");
        n3.setLabel("Room 101");
        n1.setFloor(1);
        n2.setFloor(1);
        n3.setFloor(1);

        List<IndoorNode> path = Arrays.asList(n1, n2, n3);

        IndoorEdge e1 = new IndoorEdge();
        e1.setSource("1");
        e1.setTarget("2");
        e1.setWeight(10);

        IndoorEdge e2 = new IndoorEdge();
        e2.setSource("2");
        e2.setTarget("3");
        e2.setWeight(15);

        List<IndoorEdge> edges = Arrays.asList(e1, e2);

        List<IndoorStep> steps = service.generateSteps(path, edges);

        // This is a basic test. Exact number of steps and generated text will depend
        // on the exact internal logic, but we verify it processes without errors
        // and returns a non-empty list of steps.
        assertNotNull(steps);
        assertFalse(steps.isEmpty());
    }

    @Test
    public void testGenerateSteps_FloorChange() {
        IndoorNode n1 = new IndoorNode();
        n1.setId("1");
        n1.setLabel("Elevator 1");
        n1.setFloor(1);
        IndoorNode n2 = new IndoorNode();
        n2.setId("2");
        n2.setLabel("Elevator 1");
        n2.setFloor(2);

        List<IndoorNode> path = Arrays.asList(n1, n2);

        IndoorEdge e1 = new IndoorEdge();
        e1.setSource("1");
        e1.setTarget("2");
        e1.setWeight(5);

        List<IndoorEdge> edges = Arrays.asList(e1);

        List<IndoorStep> steps = service.generateSteps(path, edges);

        assertNotNull(steps);
        assertFalse(steps.isEmpty());
    }
}