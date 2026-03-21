package com.soen390.flightcrew.testing;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class E2EMockCalendarDataTest {

    @Test
    void testGetMockCalendars() {
        // Just confirm that the method returns a non-empty list of calendars
        var calendars = E2EMockCalendarData.getMockCalendars();
        assertNotNull(calendars);
        assertFalse(calendars.isEmpty());
    }

    @Test
    void testGetMockEvents() {
        // Confirm that the method returns a non-empty list of events
        var events = E2EMockCalendarData.getMockEvents();
        assertNotNull(events);
        assertFalse(events.isEmpty());
    }

}
