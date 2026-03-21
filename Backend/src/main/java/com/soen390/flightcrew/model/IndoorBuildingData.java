package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IndoorBuildingData {
    private Map<String, String> meta;
    private List<IndoorNode> nodes;
    private List<IndoorEdge> edges;
}
