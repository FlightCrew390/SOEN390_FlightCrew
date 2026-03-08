import { DepartureOption } from "../types/Directions";

export const DEPARTURE_OPTIONS: { value: DepartureOption; label: string }[] = [
  { value: "now", label: "Leave now" },
  { value: "depart_at", label: "Depart at" },
  { value: "arrive_by", label: "Arrive by" },
];
