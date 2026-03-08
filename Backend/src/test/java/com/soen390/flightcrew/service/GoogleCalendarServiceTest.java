package com.soen390.flightcrew.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.CalendarList;
import com.google.api.services.calendar.model.CalendarListEntry;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.Events;
import com.soen390.flightcrew.model.CalendarEventDTO;
import com.soen390.flightcrew.model.CalendarInfoDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class GoogleCalendarServiceTest {

        private final GoogleCalendarService googleCalendarService = new GoogleCalendarService();

        @Test
        void fetchCalendarList_ReturnsMappedCalendars() throws Exception {
                Calendar calendarApi = mock(Calendar.class);
                Calendar.CalendarList calendarListApi = mock(Calendar.CalendarList.class);
                Calendar.CalendarList.List request = mock(Calendar.CalendarList.List.class);

                CalendarListEntry entry = new CalendarListEntry()
                                .setId("calendar-id")
                                .setSummary("My Calendar")
                                .setDescription("Team events")
                                .setBackgroundColor("#ffffff")
                                .setPrimary(true);
                CalendarList payload = new CalendarList().setItems(List.of(entry));

                when(calendarApi.calendarList()).thenReturn(calendarListApi);
                when(calendarListApi.list()).thenReturn(request);
                when(request.setMinAccessRole("reader")).thenReturn(request);
                when(request.execute()).thenReturn(payload);

                GoogleCalendarService service = new TestableGoogleCalendarService(calendarApi);

                List<CalendarInfoDTO> result = service.fetchCalendarList("token");

                assertEquals(1, result.size());
                assertEquals("calendar-id", result.get(0).getId());
                assertEquals("My Calendar", result.get(0).getSummary());
                assertEquals("Team events", result.get(0).getDescription());
                assertEquals("#ffffff", result.get(0).getBackgroundColor());
                assertTrue(result.get(0).isPrimary());
                verify(request).setMinAccessRole("reader");
                verify(request).execute();
        }

        @Test
        void fetchCalendarList_WhenApiThrows_MapsToUnauthorized() throws Exception {
                Calendar calendarApi = mock(Calendar.class);
                Calendar.CalendarList calendarListApi = mock(Calendar.CalendarList.class);
                Calendar.CalendarList.List request = mock(Calendar.CalendarList.List.class);

                when(calendarApi.calendarList()).thenReturn(calendarListApi);
                when(calendarListApi.list()).thenReturn(request);
                when(request.setMinAccessRole("reader")).thenReturn(request);
                when(request.execute()).thenThrow(new IOException("boom"));

                GoogleCalendarService service = new TestableGoogleCalendarService(calendarApi);

                ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                                () -> service.fetchCalendarList("token"));

                assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
                assertTrue(ex.getReason().contains("Failed to fetch calendar list"));
        }

        @Test
        void fetchEvents_UsesPrimaryCalendarWhenCalendarIdMissing() throws Exception {
                Calendar calendarApi = mock(Calendar.class);
                Calendar.Events eventsApi = mock(Calendar.Events.class);
                Calendar.Events.List request = mock(Calendar.Events.List.class);

                Event event = new Event()
                                .setId("e1")
                                .setSummary("Standup")
                                .setDescription("Daily sync")
                                .setLocation("Room A")
                                .setStart(new EventDateTime().setDateTime(new DateTime("2026-03-08T10:00:00Z")))
                                .setEnd(new EventDateTime().setDateTime(new DateTime("2026-03-08T10:15:00Z")));
                Events payload = new Events().setItems(List.of(event));

                when(calendarApi.events()).thenReturn(eventsApi);
                when(eventsApi.list("primary")).thenReturn(request);
                when(request.setSingleEvents(true)).thenReturn(request);
                when(request.setOrderBy("startTime")).thenReturn(request);
                when(request.execute()).thenReturn(payload);

                GoogleCalendarService service = new TestableGoogleCalendarService(calendarApi);

                List<CalendarEventDTO> result = service.fetchEvents("token", null, null, "");

                assertEquals(1, result.size());
                assertEquals("e1", result.get(0).getId());
                verify(eventsApi).list("primary");
                verify(request, never()).setTimeMin(any(DateTime.class));
                verify(request, never()).setTimeMax(any(DateTime.class));
                verify(request).execute();
        }

        @Test
        void fetchEvents_WithTimeMinMaxAndCalendarId_AppliesFilters() throws Exception {
                Calendar calendarApi = mock(Calendar.class);
                Calendar.Events eventsApi = mock(Calendar.Events.class);
                Calendar.Events.List request = mock(Calendar.Events.List.class);

                when(calendarApi.events()).thenReturn(eventsApi);
                when(eventsApi.list("team-calendar")).thenReturn(request);
                when(request.setSingleEvents(true)).thenReturn(request);
                when(request.setOrderBy("startTime")).thenReturn(request);
                when(request.setTimeMin(any(DateTime.class))).thenReturn(request);
                when(request.setTimeMax(any(DateTime.class))).thenReturn(request);
                when(request.execute()).thenReturn(new Events().setItems(List.of()));

                GoogleCalendarService service = new TestableGoogleCalendarService(calendarApi);

                service.fetchEvents("token", "2026-03-01T00:00:00Z", "2026-03-31T23:59:59Z", "team-calendar");

                verify(eventsApi).list("team-calendar");
                verify(request).setTimeMin(new DateTime("2026-03-01T00:00:00Z"));
                verify(request).setTimeMax(new DateTime("2026-03-31T23:59:59Z"));
                verify(request).execute();
        }

        @Test
        void fetchEvents_WhenApiThrows_MapsToUnauthorized() throws Exception {
                Calendar calendarApi = mock(Calendar.class);
                Calendar.Events eventsApi = mock(Calendar.Events.class);
                Calendar.Events.List request = mock(Calendar.Events.List.class);

                when(calendarApi.events()).thenReturn(eventsApi);
                when(eventsApi.list("primary")).thenReturn(request);
                when(request.setSingleEvents(true)).thenReturn(request);
                when(request.setOrderBy("startTime")).thenReturn(request);
                when(request.execute()).thenThrow(new IOException("boom"));

                GoogleCalendarService service = new TestableGoogleCalendarService(calendarApi);

                ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                                () -> service.fetchEvents("token", null, null, null));

                assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
                assertTrue(ex.getReason().contains("Failed to fetch calendar events"));
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

        private static final class TestableGoogleCalendarService extends GoogleCalendarService {
                private final Calendar calendarApi;

                private TestableGoogleCalendarService(Calendar calendarApi) {
                        this.calendarApi = calendarApi;
                }

                @Override
                protected Calendar buildCalendarClient(String accessToken) {
                        return calendarApi;
                }
        }

}
