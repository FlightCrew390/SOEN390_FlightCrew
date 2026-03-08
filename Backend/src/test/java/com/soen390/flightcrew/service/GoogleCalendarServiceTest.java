package com.soen390.flightcrew.service;

import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.client.util.DateTime;
import com.soen390.flightcrew.model.CalendarEventDTO;
import com.soen390.flightcrew.model.CalendarInfoDTO;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

class GoogleCalendarServiceTest {

        private final GoogleCalendarService googleCalendarService = new GoogleCalendarService();

        @Test
        void fetchEvents_InvalidToken_ThrowsException() {
                // Test that invalid tokens cause exceptions to be thrown
                // Since we can't easily mock the Google API calls, we test that the service
                // properly propagates exceptions when the API calls fail

                String invalidToken = "invalid-token";

                assertThrows(Exception.class, () -> {
                        googleCalendarService.fetchEvents(invalidToken, null, null, null);
                });
        }

        @Test
        void fetchEvents_WithTimeParameters_InvalidToken_ThrowsException() {
                // Test that invalid tokens cause exceptions even with time parameters

                String invalidToken = "invalid-token";
                String timeMin = "2023-01-01T00:00:00Z";
                String timeMax = "2023-01-02T00:00:00Z";

                assertThrows(Exception.class, () -> {
                        googleCalendarService.fetchEvents(invalidToken, timeMin, timeMax, null);
                });
        }

        @Test
        void toDTO_RegularEvent() throws Exception {
                // Test the toEventDTO method for regular (timed) events
                Method toDTOMethod = GoogleCalendarService.class.getDeclaredMethod("toEventDTO", Event.class);
                toDTOMethod.setAccessible(true);

                Event event = new Event()
                                .setId("test-id")
                                .setSummary("Test Event")
                                .setDescription("Test Description")
                                .setLocation("Test Location");

                EventDateTime start = new EventDateTime()
                                .setDateTime(new DateTime("2023-01-01T10:00:00Z"));
                EventDateTime end = new EventDateTime()
                                .setDateTime(new DateTime("2023-01-01T11:00:00Z"));

                event.setStart(start);
                event.setEnd(end);

                CalendarEventDTO result = (CalendarEventDTO) toDTOMethod.invoke(googleCalendarService, event);

                assertNotNull(result);
                assertEquals("test-id", result.getId());
                assertEquals("Test Event", result.getSummary());
                assertEquals("Test Description", result.getDescription());
                assertEquals("Test Location", result.getLocation());
                assertEquals("2023-01-01T10:00:00.000Z", result.getStart());
                assertEquals("2023-01-01T11:00:00.000Z", result.getEnd());
                assertFalse(result.isAllDay());
        }

        @Test
        void toDTO_AllDayEvent() throws Exception {
                // Test the toEventDTO method for all-day events
                Method toDTOMethod = GoogleCalendarService.class.getDeclaredMethod("toEventDTO", Event.class);
                toDTOMethod.setAccessible(true);

                Event event = new Event()
                                .setId("all-day-id")
                                .setSummary("All Day Event")
                                .setDescription("All Day Description")
                                .setLocation("All Day Location");

                EventDateTime start = new EventDateTime()
                                .setDate(new DateTime("2023-01-01"));
                EventDateTime end = new EventDateTime()
                                .setDate(new DateTime("2023-01-02"));

                event.setStart(start);
                event.setEnd(end);

                CalendarEventDTO result = (CalendarEventDTO) toDTOMethod.invoke(googleCalendarService, event);

                assertNotNull(result);
                assertEquals("all-day-id", result.getId());
                assertEquals("All Day Event", result.getSummary());
                assertEquals("All Day Description", result.getDescription());
                assertEquals("All Day Location", result.getLocation());
                assertEquals("2023-01-01", result.getStart());
                assertEquals("2023-01-02", result.getEnd());
                assertTrue(result.isAllDay());
        }

        @Test
        void toDTO_EventWithNullFields() throws Exception {
                // Test the toDTO method with null/empty fields
                Method toDTOMethod = GoogleCalendarService.class.getDeclaredMethod("toEventDTO", Event.class);
                toDTOMethod.setAccessible(true);

                Event event = new Event()
                                .setId("null-test-id");

                EventDateTime start = new EventDateTime()
                                .setDateTime(new DateTime("2023-01-01T10:00:00Z"));
                EventDateTime end = new EventDateTime()
                                .setDateTime(new DateTime("2023-01-01T11:00:00Z"));

                event.setStart(start);
                event.setEnd(end);

                CalendarEventDTO result = (CalendarEventDTO) toDTOMethod.invoke(googleCalendarService, event);

                assertNotNull(result);
                assertEquals("null-test-id", result.getId());
                assertNull(result.getSummary());
                assertNull(result.getDescription());
                assertNull(result.getLocation());
                assertEquals("2023-01-01T10:00:00.000Z", result.getStart());
                assertEquals("2023-01-01T11:00:00.000Z", result.getEnd());
                assertFalse(result.isAllDay());
        }

        @Test
        void fetchCalendarList_InvalidToken_ThrowsException() {
                // Test that invalid tokens cause exceptions when fetching calendar list

                String invalidToken = "invalid-token";
                assertThrows(Exception.class, () -> {
                        googleCalendarService.fetchCalendarList(invalidToken);
                });
        }

        @Test
        void toCalendarInfoDTO_NullFields() throws Exception {
                // Test the toCalendarInfoDTO method with null/empty fields
                Method toCalendarInfoDTOMethod = GoogleCalendarService.class.getDeclaredMethod("toCalendarInfoDTO",
                                com.google.api.services.calendar.model.CalendarListEntry.class);
                toCalendarInfoDTOMethod.setAccessible(true);
                com.google.api.services.calendar.model.CalendarListEntry entry = new com.google.api.services.calendar.model.CalendarListEntry()
                                .setId("calendar-id");
                CalendarInfoDTO result = (CalendarInfoDTO) toCalendarInfoDTOMethod.invoke(googleCalendarService, entry);
                assertNotNull(result);
                assertEquals("calendar-id", result.getId());
                assertNull(result.getSummary());
                assertNull(result.getDescription());
                assertNull(result.getBackgroundColor());
                assertFalse(result.isPrimary());
        }

}
