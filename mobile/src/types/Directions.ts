import { IndoorRoom } from "./IndoorRoom";

export const TRAVEL_MODE = {
  WALK: "WALK",
  DRIVE: "DRIVE",
  BICYCLE: "BICYCLE",
  TRANSIT: "TRANSIT",
  SHUTTLE: "SHUTTLE",
} as const;

export type TravelMode = (typeof TRAVEL_MODE)[keyof typeof TRAVEL_MODE];

export const PREVIEW_TRAVEL_MODES: readonly TravelMode[] = [
  TRAVEL_MODE.WALK,
  TRAVEL_MODE.BICYCLE,
  TRAVEL_MODE.TRANSIT,
  TRAVEL_MODE.DRIVE,
  TRAVEL_MODE.SHUTTLE,
];

export interface DirectionsResponse {
  routes: Route[];
}

export interface Route {
  legs: Leg[];
  polyline: EncodedPolyline;
  distanceMeters: number;
  duration: string; // e.g. "123s"
}

export interface Leg {
  distanceMeters: number;
  duration: string;
  steps: Step[];
}

export interface Step {
  distanceMeters: number;
  staticDuration: string;
  polyline: EncodedPolyline;
  navigationInstruction?: NavigationInstruction;
  travelMode?: string;
  transitDetails?: {
    stopDetails?: {
      arrivalStop?: { name?: string };
      departureStop?: { name?: string };
      arrivalTime?: string;
      departureTime?: string;
    };
    transitLine?: {
      name?: string;
      nameShort?: string;
      vehicle?: {
        name?: { text?: string };
        type?: string;
      };
    };
    stopCount?: number;
  };
}

export interface NavigationInstruction {
  maneuver: string;
  instructions: string;
}

export interface EncodedPolyline {
  encodedPolyline: string;
}

/** Parsed route data ready for the UI */
export interface RouteInfo {
  coordinates: { latitude: number; longitude: number }[];
  distanceMeters: number;
  durationSeconds: number;
  /** Optional human-readable duration (e.g. shuttle "21 mins") */
  durationText?: string;
  /** Optional human-readable distance (e.g. shuttle "8.3 km") */
  distanceText?: string;
  steps: StepInfo[];
  /** Optional sequence of nodes representing an indoor path */
  indoorPath?: IndoorRoom[];
  /** Optional sequence of nodes representing the origin indoor path (from start room to exit) */
  indoorPathOrigin?: IndoorRoom[];
  /** Step-by-step indoor instructions for the destination building */
  indoorSteps?: StepInfo[];
  /** Step-by-step indoor instructions for the origin building */
  indoorStepsOrigin?: StepInfo[];
}

export interface StepInfo {
  distanceMeters: number;
  durationSeconds: number;
  instruction: string;
  maneuver: string;
  coordinates: { latitude: number; longitude: number }[];
  travelMode?: string; // e.g., "WALK", "BICYCLE", "TRANSIT"
  transitDetails?: TransitStepDetails;
  startFloor?: number;
  endFloor?: number;
}

/** Parsed transit details for a transit step */
export interface TransitStepDetails {
  departureStopName: string;
  arrivalStopName: string;
  departureTime: string;
  arrivalTime: string;
  lineName: string;
  lineShortName: string;
  vehicleType: string;
  vehicleName: string;
  stopCount: number;
}

export type DepartureOption = "now" | "depart_at" | "arrive_by";

export interface DepartureTimeConfig {
  option: DepartureOption;
  date: Date;
}

export const DEFAULT_DEPARTURE_CONFIG: DepartureTimeConfig = {
  option: "now",
  date: new Date(),
};
