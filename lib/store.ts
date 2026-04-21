import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoughRunwayModel, StoredData } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants";
import { debounce } from "@/lib/hooks";

// Create a default model with demo data (Nexus Labs)
const createDefaultModel = (): RoughRunwayModel => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: "Nexus Labs Demo",
    createdAt: now,
    updatedAt: now,
    projectionMonths: 18,
    startDate: new Date().toISOString().slice(0, 7), // YYYY-MM
    baseCurrency: "USD",
    extendedRunwayEnabled: true,
    treasury: {
      stablecoins: [
        { id: uuidv4(), name: "USDC", amount: 2000000 },
        { id: uuidv4(), name: "USDT", amount: 0 },
      ],
      fiat: [{ id: uuidv4(), currency: "USD", amount: 0 }],
      volatileAssets: [
        {
          id: uuidv4(),
          name: "Nexus Token",
          ticker: "NEX",
          tier: "native",
          quantity: 50000000,
          currentPrice: 0.2,
          priceSource: "manual",
          liquidationPriority: 50,
          liquidity: {
            maxSellUnit: "percent_of_volume",
            maxSellPerMonth: 0,
            percentOfVolume: 0.02,
            dailyVolume: 1000000,
            haircutPercent: 15,
            priceAssumption: "constant",
          },
        },
        {
          id: uuidv4(),
          name: "Ethereum",
          ticker: "ETH",
          tier: "major",
          quantity: 100,
          currentPrice: 3000,
          priceSource: "manual",
          liquidationPriority: 10,
          liquidity: {
            maxSellUnit: "tokens",
            maxSellPerMonth: 10,
            haircutPercent: 2,
            priceAssumption: "constant",
          },
        },
        {
          id: uuidv4(),
          name: "Bitcoin",
          ticker: "BTC",
          tier: "major",
          quantity: 2,
          currentPrice: 60000,
          priceSource: "manual",
          liquidationPriority: 20,
          liquidity: {
            maxSellUnit: "tokens",
            maxSellPerMonth: 0.1,
            haircutPercent: 5,
            priceAssumption: "constant",
          },
        },
      ],
    },
    burnCategories: [
      {
        id: uuidv4(),
        name: "Headcount & Payroll",
        type: "preset",
        presetKey: "headcount",
        monthlyBaseline: 450000,
        currency: "fiat",
        growthRate: 0.02,
        adjustments: [],
        isActive: true,
      },
      {
        id: uuidv4(),
        name: "Infrastructure & Tooling",
        type: "preset",
        presetKey: "infrastructure",
        monthlyBaseline: 50000,
        currency: "fiat",
        growthRate: 0,
        adjustments: [],
        isActive: true,
      },
      {
        id: uuidv4(),
        name: "Token Incentives",
        type: "preset",
        presetKey: "token_incentives",
        monthlyBaseline: 200000,
        currency: "fiat",
        growthRate: 0,
        adjustments: [],
        isActive: true,
      },
    ],
    inflowCategories: [
      {
        id: uuidv4(),
        name: "Revenue / Fees",
        type: "preset",
        presetKey: "revenue",
        monthlyBaseline: 150000,
        growthRate: 0.05,
        adjustments: [],
        isActive: true,
      },
      {
        id: uuidv4(),
        name: "Staking Rewards",
        type: "preset",
        presetKey: "staking",
        monthlyBaseline: 25000,
        growthRate: 0,
        adjustments: [],
        isActive: true,
      },
    ],
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
export const useDebouncedCryptoRunwayStore = (() => {
  let debouncedUpdate: ((updates: Partial<RoughRunwayModel>) => void) | null = null;
  
  return () => {
    const { updateModel } = useCryptoRunwayStore();
    
    if (!debouncedUpdate) {
      debouncedUpdate = debounce(updateModel, 500);
    }
    
    return {
      ...useCryptoRunwayStore(),
      updateModel: debouncedUpdate
    };
  };
})();