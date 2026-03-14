import { CAMPUSES } from "../constants/campuses";
import { Building } from "../types/Building";
import type {
  ShuttleDeparture,
  ShuttleScheduleResponse,
} from "../services/ShuttleService";

/** Approximate radius (in degrees ≈ 1 km) to consider "near" a campus */
const CAMPUS_PROXIMITY_DEG = 0.01;

/** Campus identifiers used by this module. */
export type ShuttleCampus = "SGW" | "LOY";

/**
 * Shuttle stop coordinates.
 * SGW: Hall Building (first point in sgw_to_loyola route).
 * LOY: Loyola terminus (last point in sgw_to_loyola route).
 */
export const SHUTTLE_STOPS: Record<
  ShuttleCampus,
  { latitude: number; longitude: number }
> = {
  SGW: { latitude: 45.49697, longitude: -73.57851 },
  LOY: { latitude: 45.45865, longitude: -73.63896 },
};

/**
 * Determine which campus a GPS coordinate is near, if any.
 */
export function getCampusForLocation(
  lat: number,
  lng: number,
): ShuttleCampus | null {
  const sgw = CAMPUSES.SGW.location;
  const loy = CAMPUSES.LOYOLA.location;

  const dSGW = Math.hypot(lat - sgw.latitude, lng - sgw.longitude);
  const dLOY = Math.hypot(lat - loy.latitude, lng - loy.longitude);

  if (dSGW <= CAMPUS_PROXIMITY_DEG) return "SGW";
  if (dLOY <= CAMPUS_PROXIMITY_DEG) return "LOY";
  return null;
}

/**
 * Determine the campus of a building from its `campus` field.
 */
export function getCampusForBuilding(building: Building): ShuttleCampus | null {
  const c = building.campus?.toUpperCase();
  if (c === "SGW") return "SGW";
  if (c === "LOY") return "LOY";
  return null;
}

/**
 * Returns true when origin and destination are on different campuses.
 */
export function isShuttleEligible(
  originCampus: ShuttleCampus | null,
  destCampus: ShuttleCampus | null,
): boolean {
  if (!originCampus || !destCampus) return false;
  return originCampus !== destCampus;
}

/**
 * Parse a schedule time string (e.g. "09:15") into today's Date object,
 * or a Date on the same day as `referenceDate`.
 */
export function parseScheduleTime(
  timeStr: string,
  referenceDate: Date = new Date(),
): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(referenceDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Returns true when the current time is within the shuttle operating window:
 *   - 30 minutes before service start
 *   - Until the last departure that could serve the user (from their origin campus)
 *
 * Returns false on weekends / no-service days.
 */
export function isWithinOperatingHours(
  schedule: ShuttleScheduleResponse,
  originCampus: ShuttleCampus,
  now: Date = new Date(),
): boolean {
  if (schedule.no_service) return false;
  if (!schedule.service_start || schedule.departures.length === 0) return false;

  const serviceStart = parseScheduleTime(schedule.service_start, now);
  const bufferStart = new Date(serviceStart.getTime() - 30 * 60 * 1000);

  // Find the last departure from the origin campus
  const lastDep = getLastDepartureTime(schedule.departures, originCampus, now);
  if (!lastDep) return false;

  return now >= bufferStart && now <= lastDep;
}

/**
 * Gets the time of the last departure from `originCampus`.
 */
function getLastDepartureTime(
  departures: ShuttleDeparture[],
  originCampus: ShuttleCampus,
  referenceDate: Date,
): Date | null {
  for (let i = departures.length - 1; i >= 0; i--) {
    const dep = departures[i];
    const timeStr =
      originCampus === "LOY" ? dep.loyola_departure : dep.sgw_departure;
    if (timeStr) {
      return parseScheduleTime(timeStr, referenceDate);
    }
  }
  return null;
}

/**
 * Find the next shuttle departure from `originCampus` at or after `now`.
 * Returns null if no more departures today.
 */
export function getNextDeparture(
  departures: ShuttleDeparture[],
  originCampus: ShuttleCampus,
  now: Date = new Date(),
): { departure: ShuttleDeparture; departureTime: Date } | null {
  for (const dep of departures) {
    const timeStr =
      originCampus === "LOY" ? dep.loyola_departure : dep.sgw_departure;
    if (!timeStr) continue;

    const depTime = parseScheduleTime(timeStr, now);
    if (depTime >= now) {
      return { departure: dep, departureTime: depTime };
    }
  }
  return null;
}

/**
 * Get the current day-of-week string (e.g. "MONDAY") for the shuttle API.
 */
export function getDayOfWeek(date: Date = new Date()): string {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[date.getDay()];
}
