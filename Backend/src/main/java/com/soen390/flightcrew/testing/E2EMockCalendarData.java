package com.soen390.flightcrew.testing;

import com.soen390.flightcrew.model.CalendarEventDTO;
import com.soen390.flightcrew.model.CalendarInfoDTO;
import java.util.Arrays;
import java.util.List;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Mock data for E2E tests when EXPO_PUBLIC_E2E_MODE is enabled on the mobile
 * side.
 * Provides fake calendars and events so E2E tests can exercise
 * calendar-dependent flows
 * without requiring real Google OAuth credentials.
 */
public class E2EMockCalendarData {
    private E2EMockCalendarData() {
        /* This utility class should not be instantiated */
    }

    public static final String E2E_FAKE_ACCESS_TOKEN = "e2e-fake-access-token";

    public static List<CalendarInfoDTO> getMockCalendars() {
        return Arrays.asList(
                new CalendarInfoDTO(
                        "primary-cal",
                        "School",
                        "University schedule",
                        "#4285F4",
                        true),
                new CalendarInfoDTO(
                        "secondary-cal",
                        "Personal",
                        null,
                        "#34A853",
                        false),
                new CalendarInfoDTO(
                        "work-cal",
                        "Work",
                        "Part-time job schedule",
                        "#EA4335",
                        false));
    }

    /**
     * Build mock events relative to today so the "upcoming event" logic
     * always finds a future event regardless of when the test runs.
     */
    public static List<CalendarEventDTO> getMockEvents() {
        Instant now = Instant.now();
        ZonedDateTime nowZoned = now.atZone(ZoneId.of("UTC"));

        // Create events at +1h, +3h, and +5h from now, each lasting 1-1.25 hours
        ZonedDateTime event1Start = nowZoned.plusHours(1).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime event1End = event1Start.plusHours(1).plusMinutes(15);

        ZonedDateTime event2Start = nowZoned.plusHours(3).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime event2End = event2Start.plusHours(1);

        ZonedDateTime event3Start = nowZoned.plusHours(5).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime event3End = event3Start.plusHours(1);

        return Arrays.asList(
                new CalendarEventDTO(
                        "e2e-evt-1",
                        "SOEN 390 Lecture",
                        "Software Engineering Team Design Project",
                        "H 920",
                        event1Start.toInstant().toString(),
                        event1End.toInstant().toString(),
                        false),
                new CalendarEventDTO(
                        "e2e-evt-2",
                        "COMP 346 Tutorial",
                        "Operating Systems tutorial",
                        "MB 3.270",
                        event2Start.toInstant().toString(),
                        event2End.toInstant().toString(),
                        false),
                new CalendarEventDTO(
                        "e2e-evt-3",
                        "Study Group",
                        "Group study session",
                        null,
                        event3Start.toInstant().toString(),
                        event3End.toInstant().toString(),
                        false));
    }

    /**
     * Check if the given access token is the E2E fake token.
     */
    public static boolean isE2EMode(String accessToken) {
        return E2E_FAKE_ACCESS_TOKEN.equals(accessToken);
    }
}
