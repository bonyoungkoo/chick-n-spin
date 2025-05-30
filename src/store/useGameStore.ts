import { create } from "zustand";

interface BetRecord {
  timestamp: number;
  bets: Record<string, number>;
  totalBet: number;
  result: string | null;
  winAmount: number;
  isWin: boolean;
}

interface GameState {
  score: number;
  history: BetRecord[];
  setScore: (score: number) => void;
  addHistory: (record: Omit<BetRecord, "timestamp">) => void;
  clearHistory: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 100,
  history: [],
  setScore: (score) => set({ score }),
  addHistory: (record) =>
    set((state) => ({
      history: [
        {
          ...record,
          timestamp: Date.now(),
        },
        ...state.history,
      ].slice(0, 50), // 최근 50개까지만 유지
    })),
  clearHistory: () => set({ history: [] }),
}));
