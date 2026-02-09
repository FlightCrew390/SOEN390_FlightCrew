import { useEffect, useState } from "react";
import { BuildingDataService } from "../services/BuildingDataService";
import { Building } from "../types/Building";

export const useBuildingData = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BuildingDataService.fetchBuildings();
      setBuildings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch buildings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  return { buildings, loading, error, refetch: loadBuildings };
};
