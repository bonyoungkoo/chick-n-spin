"use client";

import React, { useEffect, useState } from "react";

type BetMap = Record<string, number>;

interface BetPanelProps {
  bets: BetMap;
  onBet: (value: string) => void;
  onReset: () => void;
  winningNumber: string | null;
  winStreak: number;
}

const betOptions = ["1", "3", "5", "10", "20"];

const colorMap: Record<string, { bg: string; hover: string; active: string }> =
  {
    "1": {
      bg: "bg-[#e8b334]",
      hover: "hover:bg-[#e8b334]",
      active: "active:bg-[#e8b334]",
    },
    "3": {
      bg: "bg-[#6bbb56]",
      hover: "hover:bg-[#6bbb56]",
      active: "active:bg-[#6bbb56]",
    },
    "5": {
      bg: "bg-[#4c83b5]",
      hover: "hover:bg-[#4c83b5]",
      active: "active:bg-[#4c83b5]",
    },
    "10": {
      bg: "bg-[#bd65a0]",
      hover: "hover:bg-[#bd65a0]",
      active: "active:bg-[#bd65a0]",
    },
    "20": {
      bg: "bg-[#c75a38]",
      hover: "hover:bg-[#c75a38]",
      active: "active:bg-[#c75a38]",
    },
  };

// 배당률 설정 (섹터 수에 따라 조정)
const getStreakMultiplier = (streak: number): number => {
  if (streak >= 9) return 4;
  if (streak >= 6) return 2;
  if (streak >= 3) return 1;
  return 0;
};

const getStreakText = (streak: number): string => {
  if (streak >= 9) return "4배";
  if (streak >= 6) return "2배";
  if (streak >= 3) return "+1배";
  return "";
};

const calculateFinalMultiplier = (
  baseMultiplier: number,
  streak: number
): number => {
  const streakBonus = getStreakMultiplier(streak);
  if (streakBonus === 0) return baseMultiplier;
  if (streakBonus === 1) return baseMultiplier + 1;
  return baseMultiplier * streakBonus;
};

export default function BetPanel({
  bets,
  onBet,
  onReset,
  winningNumber,
  winStreak,
}: BetPanelProps) {
  const [lastBets, setLastBets] = useState<Record<string, number>>({});
  const [winningLED, setWinningLED] = useState<string | null>(null);

  // 배팅 상태 변경 감지
  useEffect(() => {
    // 배팅이 있는 경우에만 상태 업데이트
    if (Object.values(bets).some((v) => v > 0)) {
      setLastBets(bets);
    }
  }, [bets]);

  // 당첨 숫자 감지
  useEffect(() => {
    if (winningNumber !== null) {
      console.log("Winning check:", { winningNumber, lastBets });

      // 이전 배팅 상태에서 당첨 여부 확인
      if (lastBets[winningNumber] > 0) {
        setWinningLED(winningNumber);

        const timer = setTimeout(() => {
          setWinningLED(null);
        }, 3000);

        return () => clearTimeout(timer);
      }
    } else {
      setWinningLED(null);
    }
  }, [winningNumber, lastBets]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 flex-wrap justify-center">
        {betOptions.map((value) => {
          const betAmount = bets[value] || 0;
          const hasBet = betAmount > 0;
          const isLEDOn = value === winningLED;
          const color = colorMap[value];
          const colorValue = color.bg.replace("bg-[", "").replace("]", "");
          const baseMultiplier = parseInt(value);
          const finalMultiplier = calculateFinalMultiplier(
            baseMultiplier,
            winStreak
          );
          const hasStreakBonus = winStreak >= 3;

          return (
            <div key={value} className="flex flex-col items-center gap-1">
              <div
                className="relative w-16 h-3 rounded-sm transition-all duration-300 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: isLEDOn ? colorValue : "#e5e7eb",
                  boxShadow: isLEDOn ? `0 0 8px ${colorValue}` : "none",
                  opacity: isLEDOn ? 1 : 0.5,
                }}
              >
                {isLEDOn && (
                  <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: `linear-gradient(45deg, ${colorValue}66, ${colorValue}cc)`,
                    }}
                  />
                )}
                {isLEDOn && (
                  <span
                    className="relative text-xs font-bold animate-fadeIn"
                    style={{
                      color: "white",
                      textShadow: `0 0 4px ${colorValue}, 0 0 8px ${colorValue}`,
                    }}
                  >
                    +{lastBets[value] * 10 * finalMultiplier}
                  </span>
                )}
              </div>
              <button
                onClick={() => onBet(value)}
                className={`relative px-3 py-2 rounded-lg shadow text-sm font-semibold w-20 transition-all duration-300
                  bg-gray-100 hover:text-white active:text-white ${color.hover} ${color.active}`}
                style={
                  hasBet
                    ? {
                        border: `2px solid ${colorValue}`,
                        boxShadow: `0 0 5px ${colorValue}`,
                      }
                    : {}
                }
              >
                {`x${value}`} 배팅
                <br />
                <span className={hasStreakBonus ? "text-red-500" : ""}>
                  (x{finalMultiplier}배)
                </span>
                <br />({betAmount * 10}점)
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onReset}
        className="mt-2 text-sm underline text-gray-600 hover:text-red-500"
      >
        전체 초기화
      </button>

      <div className="mt-2 text-sm text-gray-700 text-center">
        {Object.entries(bets)
          .filter(([, count]) => count > 0)
          .map(([value, count]) => (
            <div key={value}>
              {value}에 {count * 10}점 배팅함
            </div>
          ))}
        {Object.values(bets).every((c) => c === 0) && <div>아직 배팅 없음</div>}
      </div>
    </div>
  );
}
