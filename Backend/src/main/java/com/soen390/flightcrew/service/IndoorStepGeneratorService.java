package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.IndoorEdge;
import com.soen390.flightcrew.model.IndoorNode;
import com.soen390.flightcrew.model.IndoorStep;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IndoorStepGeneratorService {

    private static final double WALKING_SPEED_MPS = 1.2;
    private static final int ELEVATOR_SECONDS_PER_FLOOR = 15;
    private static final int STAIRS_SECONDS_PER_FLOOR = 10;
    private static final double COORDINATE_SCALE = 0.03;
    private static final double STRAIGHT_THRESHOLD_DEG = 20.0;
    private static final double SLIGHT_TURN_THRESHOLD_DEG = 60.0;
    private static final double SHARP_TURN_THRESHOLD_DEG = 150.0;
    private static final String MANEUVER_STRAIGHT = "STRAIGHT";

    public List<IndoorStep> generateSteps(List<IndoorNode> pathNodes, List<IndoorEdge> edges) {
        if (pathNodes == null || pathNodes.size() < 2) {
            return List.of();
        }

        Map<String, IndoorEdge> edgeLookup = buildEdgeLookup(edges);
        List<IndoorStep> steps = new ArrayList<>();

        // Depart step
        steps.add(createDepartStep(pathNodes.get(0)));

        // Walk through the path and generate intermediate steps
        int i = 1;
        while (i < pathNodes.size()) {
            IndoorNode prev = pathNodes.get(i - 1);
            IndoorNode curr = pathNodes.get(i);
            IndoorEdge edge = lookupEdge(edgeLookup, prev.getId(), curr.getId());
            String edgeType = edge != null ? edge.getType() : "";

            // Floor transition via elevator or stairs
            boolean isElevator = "elevator".equalsIgnoreCase(edgeType)
                    || "elevator_door".equalsIgnoreCase(prev.getType())
                    || "elevator_door".equalsIgnoreCase(curr.getType());
            boolean isStair = "stair".equalsIgnoreCase(edgeType);

            if (isElevator || isStair || isFloorTransition(prev, curr)) {
                i = handleFloorTransition(steps, prev, curr, isElevator, i);
                continue;
            }

            i = processCorridorSegment(pathNodes, edgeLookup, steps, i, prev, curr);
        }

        // Arrive step
        steps.add(createArriveStep(pathNodes.get(pathNodes.size() - 1)));

        return steps;
    }

    private int handleFloorTransition(List<IndoorStep> steps, IndoorNode prev, IndoorNode curr, boolean isElevator,
            int currentIndex) {
        int floors = Math.max(1, Math.abs(floorOf(curr) - floorOf(prev)));

        if (isElevator) {
            steps.add(new IndoorStep("Take the elevator to floor " + floorOf(curr), "ELEVATOR",
                    0, ELEVATOR_SECONDS_PER_FLOOR * floors, floorOf(prev), floorOf(curr), prev.getId(),
                    curr.getId()));
        } else {
            steps.add(new IndoorStep("Take the stairs to floor " + floorOf(curr), "STAIRS",
                    0, STAIRS_SECONDS_PER_FLOOR * floors, floorOf(prev), floorOf(curr), prev.getId(),
                    curr.getId()));
        }
        return currentIndex + 1;
    }

    private int processCorridorSegment(List<IndoorNode> pathNodes, Map<String, IndoorEdge> edgeLookup,
            List<IndoorStep> steps, int i, IndoorNode prev, IndoorNode curr) {
        String startNodeId = prev.getId();
        int startFloor = floorOf(prev);
        String turnManeuver = null;

        // Check for a turn at this node (requires looking at prev, curr, next)
        if (i + 1 < pathNodes.size() && onSameFloor(prev, curr) && onSameFloor(curr, pathNodes.get(i + 1))) {
            turnManeuver = detectTurn(prev, curr, pathNodes.get(i + 1));
        }

        if (turnManeuver != null && !MANEUVER_STRAIGHT.equals(turnManeuver)) {
            return emitTurnStep(steps, i, prev, curr, startNodeId, startFloor, turnManeuver);
        } else {
            return mergeStraightSegments(pathNodes, edgeLookup, steps, i, prev, curr, startNodeId, startFloor);
        }
    }

    private int emitTurnStep(List<IndoorStep> steps, int i, IndoorNode prev, IndoorNode curr, String startNodeId,
            int startFloor, String turnManeuver) {
        double totalDist = euclideanDistance(prev, curr);
        int duration = (int) Math.round(totalDist / WALKING_SPEED_MPS);
        String instruction = turnToInstruction(turnManeuver);
        steps.add(new IndoorStep(instruction, turnManeuver, totalDist, duration,
                startFloor, floorOf(curr), startNodeId, curr.getId()));
        return i + 1;
    }

    private int mergeStraightSegments(List<IndoorNode> pathNodes, Map<String, IndoorEdge> edgeLookup,
            List<IndoorStep> steps, int i, IndoorNode prev, IndoorNode curr, String startNodeId, int startFloor) {
        double totalDist = euclideanDistance(prev, curr);
        int segEnd = i;
        boolean breakLoop = false;

        while (segEnd + 1 < pathNodes.size() && !breakLoop) {
            IndoorNode segCurr = pathNodes.get(segEnd);
            IndoorNode segNext = pathNodes.get(segEnd + 1);

            if (!onSameFloor(segCurr, segNext)) {
                breakLoop = true;
            }

            if (!breakLoop) {
                IndoorEdge nextEdge = lookupEdge(edgeLookup, segCurr.getId(), segNext.getId());
                String nextEdgeType = nextEdge != null ? nextEdge.getType() : "";
                if ("elevator".equalsIgnoreCase(nextEdgeType) || "stair".equalsIgnoreCase(nextEdgeType)) {
                    breakLoop = true;
                }
            }

            // Check if there's a turn at segNext
            if (!breakLoop && segEnd + 2 < pathNodes.size() && onSameFloor(segNext, pathNodes.get(segEnd + 2))) {
                String nextTurn = detectTurn(segCurr, segNext, pathNodes.get(segEnd + 2));
                if (nextTurn != null && !MANEUVER_STRAIGHT.equals(nextTurn)) {
                    breakLoop = true;
                }
            }

            if (!breakLoop) {
                totalDist += euclideanDistance(segCurr, segNext);
                segEnd++;
            }
        }

        if (totalDist > 0) {
            int duration = (int) Math.round(totalDist / WALKING_SPEED_MPS);
            steps.add(new IndoorStep("Walk down the corridor", MANEUVER_STRAIGHT,
                    Math.round(totalDist * 100.0) / 100.0, duration,
                    startFloor, floorOf(pathNodes.get(segEnd)),
                    startNodeId, pathNodes.get(segEnd).getId()));
        }

        return segEnd + 1;
    }

    private IndoorStep createDepartStep(IndoorNode first) {
        String label = first.getLabel() != null ? first.getLabel() : first.getId();
        String instruction = "Start walking";

        if ("room".equalsIgnoreCase(first.getType())) {
            instruction = "Start at " + label;
        } else if ("building_entry_exit".equalsIgnoreCase(first.getType())) {
            instruction = "Enter the building";
        }

        return new IndoorStep(instruction, "DEPART", 0, 0,
                floorOf(first), floorOf(first), first.getId(), first.getId());
    }

    private IndoorStep createArriveStep(IndoorNode last) {
        String label = last.getLabel() != null ? last.getLabel() : last.getId();
        String instruction = "You have arrived";

        if ("room".equalsIgnoreCase(last.getType())) {
            instruction = "Arrive at " + label;
        } else if ("building_entry_exit".equalsIgnoreCase(last.getType())) {
            instruction = "Exit the building";
        }

        return new IndoorStep(instruction, "ARRIVE", 0, 0,
                floorOf(last), floorOf(last), last.getId(), last.getId());
    }

    private Map<String, IndoorEdge> buildEdgeLookup(List<IndoorEdge> edges) {
        Map<String, IndoorEdge> lookup = new HashMap<>();
        if (edges == null)
            return lookup;
        for (IndoorEdge edge : edges) {
            lookup.put(edge.getSource() + "|" + edge.getTarget(), edge);
            lookup.put(edge.getTarget() + "|" + edge.getSource(), edge);
        }
        return lookup;
    }

    private IndoorEdge lookupEdge(Map<String, IndoorEdge> lookup, String fromId, String toId) {
        return lookup.get(fromId + "|" + toId);
    }

    private boolean isFloorTransition(IndoorNode a, IndoorNode b) {
        return !floorOf(a).equals(floorOf(b));
    }

    private boolean onSameFloor(IndoorNode a, IndoorNode b) {
        return floorOf(a).equals(floorOf(b));
    }

    private Integer floorOf(IndoorNode node) {
        return node.getFloor() != null ? node.getFloor() : 1;
    }

    private double euclideanDistance(IndoorNode a, IndoorNode b) {
        double dx = val(b.getX()) - val(a.getX());
        double dy = val(b.getY()) - val(a.getY());
        return Math.hypot(dx, dy) * COORDINATE_SCALE;
    }

    String detectTurn(IndoorNode a, IndoorNode b, IndoorNode c) {
        double abx = val(b.getX()) - val(a.getX());
        double aby = val(b.getY()) - val(a.getY());
        double bcx = val(c.getX()) - val(b.getX());
        double bcy = val(c.getY()) - val(b.getY());

        double cross = abx * bcy - aby * bcx;
        double dot = abx * bcx + aby * bcy;
        double angle = Math.toDegrees(Math.abs(Math.atan2(cross, dot)));

        if (angle < STRAIGHT_THRESHOLD_DEG) {
            return MANEUVER_STRAIGHT;
        }

        boolean isLeft = cross > 0;

        if (angle >= SHARP_TURN_THRESHOLD_DEG) {
            return isLeft ? "TURN_SHARP_LEFT" : "TURN_SHARP_RIGHT";
        } else if (angle >= SLIGHT_TURN_THRESHOLD_DEG) {
            return isLeft ? "TURN_LEFT" : "TURN_RIGHT";
        } else {
            return isLeft ? "TURN_SLIGHT_LEFT" : "TURN_SLIGHT_RIGHT";
        }
    }

    private String turnToInstruction(String maneuver) {
        return switch (maneuver) {
            case "TURN_LEFT" -> "Turn left";
            case "TURN_RIGHT" -> "Turn right";
            case "TURN_SLIGHT_LEFT" -> "Turn slightly left";
            case "TURN_SLIGHT_RIGHT" -> "Turn slightly right";
            case "TURN_SHARP_LEFT" -> "Turn sharp left";
            case "TURN_SHARP_RIGHT" -> "Turn sharp right";
            default -> "Continue walking";
        };
    }

    private double val(Double d) {
        return d != null ? d : 0.0;
    }
}
