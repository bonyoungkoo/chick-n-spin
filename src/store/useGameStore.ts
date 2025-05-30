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
  winStreak: number; // 현재 연속 성공 횟수
  bestWinStreak: number; // 최고 연속 성공 횟수
  setScore: (score: number) => void;
  addHistory: (record: Omit<BetRecord, "timestamp">) => void;
  clearHistory: () => void;
  updateWinStreak: (isWin: boolean) => void; // 연속 성공 횟수 업데이트
}

export const useGameStore = create<GameState>((set) => ({
  score: 100,
  history: [],
  winStreak: 0,
  bestWinStreak: 0,
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
  updateWinStreak: (isWin) =>
    set((state) => {
      if (isWin) {
        const newWinStreak = state.winStreak + 1;
        return {
          winStreak: newWinStreak,
          bestWinStreak: Math.max(state.bestWinStreak, newWinStreak),
        };
      } else {
        return { winStreak: 0 };
      }
    }),
}));
