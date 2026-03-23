package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.IndoorEdge;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class IndoorPathfindingService {

    private final IndoorNavigationDataService dataService;

    public IndoorPathfindingService(IndoorNavigationDataService dataService) {
        this.dataService = dataService;
    }

    public List<String> findShortestPath(String buildingId, String startNodeId, String endNodeId,
            boolean requireAccessible) {
        List<IndoorEdge> edges = dataService.getEdgesByBuilding(buildingId);
        Map<String, List<Edge>> graph = buildGraph(edges, requireAccessible);

        if (!graph.containsKey(startNodeId)) {
            return Collections.emptyList(); // Start node not in graph
        }

        PriorityQueue<NodeDistance> pq = new PriorityQueue<>(Comparator.comparingInt(nd -> nd.distance));
        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        Set<String> visited = new HashSet<>();

        distances.put(startNodeId, 0);
        pq.add(new NodeDistance(startNodeId, 0));

        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            String currentNodeId = current.nodeId;

            if (currentNodeId.equals(endNodeId)) {
                return reconstructPath(previous, endNodeId, startNodeId);
            }

            // visited.add() returns false if the element was already present
            if (!visited.add(currentNodeId)) {
                continue;
            }

            for (Edge neighbor : graph.getOrDefault(currentNodeId, Collections.emptyList())) {
                if (visited.contains(neighbor.target())) {
                    continue;
                }

                int newDist = current.distance + neighbor.weight();
                if (newDist < distances.getOrDefault(neighbor.target(), Integer.MAX_VALUE)) {
                    distances.put(neighbor.target(), newDist);
                    previous.put(neighbor.target(), currentNodeId);
                    pq.add(new NodeDistance(neighbor.target(), newDist));
                }
            }
        }

        return Collections.emptyList(); // Target unreachable
    }

    private Map<String, List<Edge>> buildGraph(List<IndoorEdge> edges, boolean requireAccessible) {
        Map<String, List<Edge>> graph = new HashMap<>();
        for (IndoorEdge edge : edges) {
            if (requireAccessible && Boolean.FALSE.equals(edge.getAccessible())) {
                continue; // Skip stairs/inaccessible routes if requested
            }
            // Undirected graph logic (add both directions)
            graph.computeIfAbsent(edge.getSource(), k -> new ArrayList<>())
                    .add(new Edge(edge.getTarget(), edge.getWeight()));
            graph.computeIfAbsent(edge.getTarget(), k -> new ArrayList<>())
                    .add(new Edge(edge.getSource(), edge.getWeight()));
        }
        return graph;
    }

    private List<String> reconstructPath(Map<String, String> previous, String endNodeId, String startNodeId) {
        List<String> path = new ArrayList<>();
        String current = endNodeId;

        while (current != null) {
            path.add(0, current); // Add to the front to reverse naturally
            if (current.equals(startNodeId))
                break;
            current = previous.get(current);
        }

        return path;
    }

    // Helper classes for Dijkstra's
    private record Edge(String target, int weight) {
    }

    private record NodeDistance(String nodeId, int distance) {
    }
}