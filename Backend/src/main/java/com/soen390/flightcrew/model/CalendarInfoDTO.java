package com.soen390.flightcrew.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CalendarInfoDTO {
    private String id;
    private String summary;
    private String description;
    private String backgroundColor;
    private boolean primary;
}
