import React, { createContext, useContext } from "react";
import { useCurrentLocation } from "../hooks/useCurrentLocation";

type LocationContextValue = ReturnType<typeof useCurrentLocation>;

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const location = useCurrentLocation();
  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be inside LocationProvider");
  return ctx;
}
