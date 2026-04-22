import { useMemo } from "react";
import { useRoughRunwayStore } from "../store";
import { computeProjection } from "../projection-engine";
import type { MonthlyProjection, RunwaySummary } from "../types";

interface ProjectionData {
  projections: MonthlyProjection[];
  summary: RunwaySummary;
}

export function useProjection(): ProjectionData {
  const { model } = useRoughRunwayStore();
  
  const projectionData = useMemo(() => {
    return computeProjection(model);
  }, [model]);
  
  return projectionData;
}