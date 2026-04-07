package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IndoorEdge {
    private String source;
    private String target;
    private String type;
    private Integer weight;
    private Boolean accessible;
}