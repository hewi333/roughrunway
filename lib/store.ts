import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoughRunwayModel, StoredData } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants";
import { debounce } from "@/lib/hooks";

// Default model for fresh visitors. Intentionally minimal: a single empty
// stable holding plus one zeroed burn line. When the dashboard sees a model
// with this name, it shows the demo Quickstart card (lib/demo-model.ts) so
// hackathon visitors get a 1-click path to a fully populated model. Real
// users can still build manually via the /setup wizard.
const createDefaultModel = (): RoughRunwayModel => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: "Untitled Model",
    createdAt: now,
    updatedAt: now,
    projectionMonths: 18,
    startDate: new Date().toISOString().slice(0, 7),
    baseCurrency: "USD",
    extendedRunwayEnabled: true,
    treasury: {
      stablecoins: [{ id: uuidv4(), name: "USDC", amount: 0 }],
      fiat: [{ id: uuidv4(), currency: "USD", amount: 0 }],
      volatileAssets: [],
    },
    burnCategories: [],
    inflowCategories: [],
    scenarios: [],
  };
};

interface RoughRunwayStore {
  model: RoughRunwayModel;
  setModel: (model: RoughRunwayModel) => void;
  updateModel: (updates: Partial<RoughRunwayModel>) => void;
  resetToDefault: () => void;
}

export const useRoughRunwayStore = create<RoughRunwayStore>()(
  persist(
    (set, get) => ({
      model: createDefaultModel(),
      setModel: (model) => set({ model }),
      updateModel: (updates) => {
        const { model } = get();
        const updatedModel = {
          ...model,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        set({ model: updatedModel });
      },
      resetToDefault: () => set({ model: createDefaultModel() }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      partialize: (state) => ({ model: state.model }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Ensure we have a valid model
        if (!state.model) {
          state.model = createDefaultModel();
        }
      },
    }
  )
);

// Create a debounced version of the store update for performance
export const useDebouncedRoughRunwayStore = (() => {
  let debouncedUpdate: ((updates: Partial<RoughRunwayModel>) => void) | null = null;
  
  return () => {
    const { updateModel } = useRoughRunwayStore();
    
    if (!debouncedUpdate) {
      debouncedUpdate = debounce(updateModel, 500);
    }
    
    return {
      ...useRoughRunwayStore(),
      updateModel: debouncedUpdate
    };
  };
})();