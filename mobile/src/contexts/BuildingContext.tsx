import React, { createContext, useContext } from "react";
import { useBuildingData } from "../hooks/useBuildingData";

type BuildingContextValue = ReturnType<typeof useBuildingData>;

const BuildingContext = createContext<BuildingContextValue | null>(null);

export function BuildingProvider({ children }: { children: React.ReactNode }) {
  const buildingData = useBuildingData();
  return (
    <BuildingContext.Provider value={buildingData}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuildings() {
  const ctx = useContext(BuildingContext);
  if (!ctx) throw new Error("useBuildings must be inside BuildingProvider");
  return ctx;
}
