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

        // 1. Build Adjacency List
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

        // 2. Setup Dijkstra's properties
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>(Comparator.comparingInt(nd -> nd.distance));
        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        Set<String> visited = new HashSet<>();

        // Initialize distances
        for (String nodeId : graph.keySet()) {
            distances.put(nodeId, Integer.MAX_VALUE);
        }

        if (!distances.containsKey(startNodeId))
            return null;

        distances.put(startNodeId, 0);
        pq.add(new NodeDistance(startNodeId, 0));

        // 3. Dijkstra's Algorithm Evaluation Loop
        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            String currentNodeId = current.nodeId;

            if (currentNodeId.equals(endNodeId)) {
                break; // Found target
            }

            if (visited.contains(currentNodeId))
                continue;
            visited.add(currentNodeId);

            List<Edge> neighbors = graph.getOrDefault(currentNodeId, new ArrayList<>());
            for (Edge neighbor : neighbors) {
                if (visited.contains(neighbor.target))
                    continue;

                int newDist = distances.get(currentNodeId) + neighbor.weight;
                if (newDist < distances.getOrDefault(neighbor.target, Integer.MAX_VALUE)) {
                    distances.put(neighbor.target, newDist);
                    previous.put(neighbor.target, currentNodeId);
                    pq.add(new NodeDistance(neighbor.target, newDist));
                }
            }
        }

        // 4. Reconstruct Path
        if (!previous.containsKey(endNodeId))
            return null; // Unreachable

        List<String> path = new ArrayList<>();
        String current = endNodeId;
        while (current != null) {
            path.add(0, current);
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