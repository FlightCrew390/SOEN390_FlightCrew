package com.soen390.flightcrew.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CalendarEventDTO {
    private String id;
    private String summary;
    private String description;
    private String location;
    private String start;
    private String end;
    private boolean allDay;
}
