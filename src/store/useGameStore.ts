import { create } from "zustand";

interface BetRecord {
  timestamp: number;
  bets: Record<string, number>;
  totalBet: number;
  result: string | null;
  winAmount: number;
  isWin: boolean;
}

interface GrowthRecord {
  timestamp: number;
  score: number;
  previousScore: number;
  level: number;
  previousLevel: number;
  type: "increase" | "decrease";
  reason: string;
}

interface GameState {
  score: number;
  history: BetRecord[];
  winStreak: number; // 현재 연속 성공 횟수
  bestWinStreak: number; // 최고 연속 성공 횟수
  growthHistory: GrowthRecord[];
  setScore: (score: number, reason?: string) => void;
  addHistory: (record: Omit<BetRecord, "timestamp">) => void;
  clearHistory: () => void;
  updateWinStreak: (isWin: boolean) => void; // 연속 성공 횟수 업데이트
}

const getLevel = (score: number) => Math.min(10, Math.floor(score / 100) + 1);

export const useGameStore = create<GameState>((set, get) => ({
  score: 100,
  history: [],
  winStreak: 0,
  bestWinStreak: 0,
  growthHistory: [],
  setScore: (newScore, reason = "") => {
    const currentState = get();
    const previousScore = currentState.score;
    const previousLevel = getLevel(previousScore);
    const newLevel = getLevel(newScore);

    // 레벨이 변경되었거나 점수 차이가 있을 때만 기록
    if (previousLevel !== newLevel || previousScore !== newScore) {
      const record: GrowthRecord = {
        timestamp: Date.now(),
        score: newScore,
        previousScore,
        level: newLevel,
        previousLevel,
        type: newScore > previousScore ? "increase" : "decrease",
        reason,
      };

      set((state) => ({
        score: newScore,
        growthHistory: [record, ...state.growthHistory],
      }));
    } else {
      set({ score: newScore });
    }
  },
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
  clearHistory: () => set({ history: [], growthHistory: [] }),
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
