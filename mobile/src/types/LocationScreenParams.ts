/**
 * Route params accepted by the Location / Map tab screen.
 * Used to deep-link into directions from other tabs (e.g. Calendar).
 */
export interface LocationScreenParams {
  /** Free-text location string to resolve to a building and open directions. */
  directionsTo?: string;
}
