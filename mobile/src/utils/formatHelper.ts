import type { DepartureTimeConfig } from "../types/Directions";

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "-- min";
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

export function formatDistance(meters: number): string {
  if (meters <= 0) return "-- m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatTime(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHour}:${displayMinutes} ${period}`;
}

export function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display} ${period}`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Plain-language sentence for the next shuttle (e.g. "Next shuttle departs in 5 minutes").
 */
export function formatShuttleNextDeparturePhrase(
  departure: Date,
  departureConfig: DepartureTimeConfig,
): string {
  const atClock = `Next shuttle departs at ${formatTime(departure)}`;

  if (departureConfig.option !== "now") {
    return atClock;
  }

  const now = new Date();
  const diffMs = departure.getTime() - now.getTime();
  const minutesRounded = Math.round(diffMs / 60_000);

  if (minutesRounded < 0) {
    return atClock;
  }
  if (minutesRounded === 0) {
    return "Next shuttle departs soon";
  }
  if (minutesRounded <= 60) {
    const unit = minutesRounded === 1 ? "minute" : "minutes";
    return `Next shuttle departs in ${minutesRounded} ${unit}`;
  }

  return atClock;
}
