package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.IndoorEdge;
import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.model.IndoorStep;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class IndoorStepGeneratorServiceExtraTest {

    private IndoorStepGeneratorService service;

    @BeforeEach
    public void setup() {
        service = new IndoorStepGeneratorService();
    }

    @Test
    public void testDetectTurn() {
        IndoorNode a = new IndoorNode();
        a.setX(0.0);
        a.setY(0.0);
        IndoorNode b = new IndoorNode();
        b.setX(1.0);
        b.setY(0.0);

        // Straight
        IndoorNode c1 = new IndoorNode();
        c1.setX(2.0);
        c1.setY(0.0);
        assertEquals("STRAIGHT", service.detectTurn(a, b, c1));

        // Slight Left
        IndoorNode c2 = new IndoorNode();
        c2.setX(2.0);
        c2.setY(1.0);
        assertEquals("TURN_SLIGHT_LEFT", service.detectTurn(a, b, c2));

        // Slight Right
        IndoorNode c3 = new IndoorNode();
        c3.setX(2.0);
        c3.setY(-1.0);
        assertEquals("TURN_SLIGHT_RIGHT", service.detectTurn(a, b, c3));

        // Left
        IndoorNode c4 = new IndoorNode();
        c4.setX(1.0);
        c4.setY(1.0);
        assertEquals("TURN_LEFT", service.detectTurn(a, b, c4));

        // Right
        IndoorNode c5 = new IndoorNode();
        c5.setX(1.0);
        c5.setY(-1.0);
        assertEquals("TURN_RIGHT", service.detectTurn(a, b, c5));

        // Sharp Left
        IndoorNode c6 = new IndoorNode();
        c6.setX(0.1);
        c6.setY(0.5);
        assertEquals("TURN_SHARP_LEFT", service.detectTurn(a, b, c6));

        // Sharp Right
        IndoorNode c7 = new IndoorNode();
        c7.setX(0.1);
        c7.setY(-0.5);
        assertEquals("TURN_SHARP_RIGHT", service.detectTurn(a, b, c7));
    }

    @Test
    public void testGenerateSteps_CorridorMerge() {
        IndoorNode n1 = new IndoorNode();
        n1.setId("1");
        n1.setFloor(1);
        n1.setX(0.0);
        n1.setY(0.0);
        n1.setType("hall");
        IndoorNode n2 = new IndoorNode();
        n2.setId("2");
        n2.setFloor(1);
        n2.setX(10.0);
        n2.setY(0.0);
        n2.setType("hall");
        IndoorNode n3 = new IndoorNode();
        n3.setId("3");
        n3.setFloor(1);
        n3.setX(20.0);
        n3.setY(0.0);
        n3.setType("hall");

        List<IndoorNode> path = Arrays.asList(n1, n2, n3);

        IndoorEdge e1 = new IndoorEdge();
        e1.setSource("1");
        e1.setTarget("2");
        e1.setType("hall");
        IndoorEdge e2 = new IndoorEdge();
        e2.setSource("2");
        e2.setTarget("3");
        e2.setType("hall");

        List<IndoorStep> steps = service.generateSteps(path, Arrays.asList(e1, e2));

        assertNotNull(steps);
        // Depart, Walk down the corridor, Arrive -> 3 steps total
        assertEquals(3, steps.size());
        assertEquals("STRAIGHT", steps.get(1).getManeuver());
    }

    @Test
    public void testGenerateSteps_Turns() {
        IndoorNode n1 = new IndoorNode();
        n1.setId("1");
        n1.setFloor(1);
        n1.setX(0.0);
        n1.setY(0.0);
        IndoorNode n2 = new IndoorNode();
        n2.setId("2");
        n2.setFloor(1);
        n2.setX(10.0);
        n2.setY(0.0);
        IndoorNode n3 = new IndoorNode();
        n3.setId("3");
        n3.setFloor(1);
        n3.setX(10.0);
        n3.setY(10.0);
        IndoorNode n4 = new IndoorNode();
        n4.setId("4");
        n4.setFloor(1);
        n4.setX(20.0);
        n4.setY(10.0);

        List<IndoorNode> path = Arrays.asList(n1, n2, n3, n4);

        IndoorEdge e1 = new IndoorEdge();
        e1.setSource("1");
        e1.setTarget("2");
        IndoorEdge e2 = new IndoorEdge();
        e2.setSource("2");
        e2.setTarget("3");
        IndoorEdge e3 = new IndoorEdge();
        e3.setSource("3");
        e3.setTarget("4");

        List<IndoorStep> steps = service.generateSteps(path, Arrays.asList(e1, e2, e3));

        assertNotNull(steps);
        // Path with a Left turn and then a Right turn.
        // n1 -> n2 -> n3 (Left turn at n2)
        // n2 -> n3 -> n4 (Right turn at n3)
        assertTrue(steps.stream().anyMatch(s -> s.getManeuver().equals("TURN_LEFT")));
        assertTrue(steps.stream().anyMatch(s -> s.getManeuver().equals("TURN_RIGHT")));
    }

    @Test
    public void testGenerateSteps_ElevatorTransition() {
        IndoorNode n1 = new IndoorNode();
        n1.setId("1");
        n1.setFloor(1);
        n1.setType("hall");
        IndoorNode n2 = new IndoorNode();
        n2.setId("2");
        n2.setFloor(2);
        n2.setType("elevator_door");

        List<IndoorNode> path = Arrays.asList(n1, n2);

        IndoorEdge e1 = new IndoorEdge();
        e1.setSource("1");
        e1.setTarget("2");
        e1.setType("elevator");

        List<IndoorStep> steps = service.generateSteps(path, Arrays.asList(e1));

        assertNotNull(steps);
        assertTrue(steps.stream().anyMatch(s -> s.getManeuver().equals("ELEVATOR")));
    }

    @Test
    public void testGenerateSteps_StairsTransition() {
        IndoorNode n1 = new IndoorNode();
        n1.setId("1");
        n1.setFloor(1);
        IndoorNode n2 = new IndoorNode();
        n2.setId("2");
        n2.setFloor(3);

        List<IndoorNode> path = Arrays.asList(n1, n2);

        IndoorEdge e1 = new IndoorEdge();
        e1.setSource("1");
        e1.setTarget("2");
        e1.setType("stair");

        List<IndoorStep> steps = service.generateSteps(path, Arrays.asList(e1));

        assertNotNull(steps);
        assertTrue(steps.stream().anyMatch(s -> s.getManeuver().equals("STAIRS")));
    }

    @Test
    public void testCreateDepartAndArriveStepsTypes() {
        IndoorNode start = new IndoorNode();
        start.setId("start");
        start.setFloor(1);
        start.setType("building_entry_exit");
        IndoorNode end = new IndoorNode();
        end.setId("end");
        end.setFloor(1);
        end.setType("building_entry_exit");

        List<IndoorNode> path = Arrays.asList(start, end);
        IndoorEdge e1 = new IndoorEdge();
        e1.setSource("start");
        e1.setTarget("end");

        List<IndoorStep> steps = service.generateSteps(path, Arrays.asList(e1));

        assertNotNull(steps);
        assertTrue(steps.get(0).getInstruction().contains("Enter the building"));
        assertTrue(steps.get(steps.size() - 1).getInstruction().contains("Exit the building"));
    }
}