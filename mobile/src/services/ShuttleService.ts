import shuttleData from "../../assets/shuttle_schedule.json";

/* ── Types ── */

export interface ShuttleDeparture {
  loyola_departure: string | null;
  sgw_departure: string | null;
  last_bus: boolean;
}

export interface ShuttleSchedule {
  day: string;
  no_service: boolean;
  service_start: string | null;
  service_end: string | null;
  departures: ShuttleDeparture[];
}

export interface ShuttleRouteCoord {
  latitude: number;
  longitude: number;
}

export interface ShuttleRoute {
  duration: string;
  distance: string;
  sgw_to_loyola: ShuttleRouteCoord[];
  loyola_to_sgw: ShuttleRouteCoord[];
}

/* ── Raw JSON shape ── */

interface RawDeparture {
  loyola?: string;
  sgw?: string;
  last_bus?: boolean;
}

interface RawScheduleData {
  duration: string;
  distance: string;
  monday_thursday: RawDeparture[];
  friday: RawDeparture[];
  sgw_to_loyola_route: ShuttleRouteCoord[];
}

/* ── Convert raw departures to our DTO ── */

function convertDepartures(raw: RawDeparture[]): ShuttleDeparture[] {
  return raw.map((d) => ({
    loyola_departure: d.loyola ?? null,
    sgw_departure: d.sgw ?? null,
    last_bus: d.last_bus ?? false,
  }));
}

/* ── Service (reads from embedded JSON, no backend needed) ── */

const data = shuttleData as RawScheduleData;
const monThuDeps = convertDepartures(data.monday_thursday);
const fridayDeps = convertDepartures(data.friday);

const NO_SERVICE_DAYS = ["SATURDAY", "SUNDAY"];

export class ShuttleService {
  /**
   * Get the shuttle schedule for a given day.
   * Reads from embedded JSON – no network call needed.
   */
  static async fetchSchedule(day?: string): Promise<ShuttleSchedule> {
    const dayUpper = (day ?? "").toUpperCase();

    if (NO_SERVICE_DAYS.includes(dayUpper)) {
      return {
        day: dayUpper,
        no_service: true,
        service_start: null,
        service_end: null,
        departures: [],
      };
    }

    const isFriday = dayUpper === "FRIDAY";
    const departures = isFriday ? fridayDeps : monThuDeps;

    // Derive service start/end from first & last departure
    const firstLoy =
      departures.find((d) => d.loyola_departure)?.loyola_departure ?? null;
    const lastEntry = departures[departures.length - 1];
    const serviceEnd =
      lastEntry?.loyola_departure ?? lastEntry?.sgw_departure ?? null;

    return {
      day: dayUpper,
      no_service: false,
      service_start: firstLoy,
      service_end: serviceEnd,
      departures,
    };
  }

  /**
   * Get the shuttle route polyline.
   * Reads from embedded JSON – no network call needed.
   */
  static async fetchRoute(): Promise<ShuttleRoute> {
    const sgwToLoyola = data.sgw_to_loyola_route;
    const loyolaToSgw = [...sgwToLoyola].reverse();

    return {
      duration: data.duration,
      distance: data.distance,
      sgw_to_loyola: sgwToLoyola,
      loyola_to_sgw: loyolaToSgw,
    };
  }
}
