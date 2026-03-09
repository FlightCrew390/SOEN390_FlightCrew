package com.soen390.flightcrew.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShuttleRouteResponse {

    @JsonProperty("duration")
    private String duration;

    @JsonProperty("distance")
    private String distance;

    @JsonProperty("sgw_to_loyola")
    private List<CoordinateDTO> sgwToLoyola;

    @JsonProperty("loyola_to_sgw")
    private List<CoordinateDTO> loyolaToSgw;
}
