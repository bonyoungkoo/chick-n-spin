"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import BatPanel from "./BatPanel";
import { useGameStore } from "@/store/useGameStore";
import BettingHistory from "./BettingHistory";
import Image from "next/image";

const sectors = [
  "1",
  "3",
  "1",
  "3",
  "1",
  "10",
  "1",
  "5",
  "1",
  "3",
  "1",
  "5",
  "1",
  "3",
  "1",
  "3",
  "1",
  "5",
  "1",
  "10",
  "1",
  "20",
  "1",
  "3",
  "5",
];

const colorMap: Record<string, string> = {
  "1": "#fcd34d",
  "3": "#6bbb56",
  "5": "#4c83b5",
  "10": "#bd65a0",
  "20": "#c75a38",
};

const sectorCount = sectors.length;
const sectorAngle = 360 / sectorCount;

export default function Roulette() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const rotation = useMotionValue(0);
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [bets, setBets] = useState<Record<string, number>>({
    "1": 0,
    "3": 0,
    "5": 0,
    "10": 0,
    "20": 0,
  });

  const {
    score,
    setScore,
    addHistory,
    winStreak,
    bestWinStreak,
    updateWinStreak,
  } = useGameStore();

  // 현재 점수에 따른 캐릭터 레벨 계산
  const characterLevel = Math.min(10, Math.floor(score / 100) + 1);

  const handleBet = (value: string) => {
    if (spinning) return;
    if (score >= 10) {
      setBets((prev) => ({
        ...prev,
        [value]: prev[value] + 1,
      }));
      setScore(score - 10, "배팅");
      if (value === result) {
        setResult(null);
      }
    } else {
      alert("배팅할 사료가 부족합니다!");
    }
  };

  const resetBets = () => {
    const totalBets = Object.values(bets).reduce(
      (sum, count) => sum + count * 10,
      0
    );
    setScore(score + totalBets, "배팅 초기화");
    setBets({
      "1": 0,
      "3": 0,
      "5": 0,
      "10": 0,
      "20": 0,
    });
  };

  const tickAngles = Array.from(
    { length: sectorCount },
    (_, i) => i * sectorAngle
  );

  const shake = useMotionValue(0);

  const triggerPinShake = useCallback(() => {
    shake.set(8);
    animate(shake, -8, { duration: 0.2 }).then(() =>
      animate(shake, 0, { duration: 0.1 })
    );
  }, [shake]);

  useEffect(() => {
    let prevAngle = rotation.get();

    const unsubscribe = rotation.on("change", (latest) => {
      const current = ((latest % 360) + 360) % 360;
      const prev = ((prevAngle % 360) + 360) % 360;

      const crossed = tickAngles.some((tick) => {
        return (
          (prev < tick && current >= tick) ||
          (prev > current && (tick > prev || tick <= current))
        );
      });

      if (crossed) triggerPinShake();

      prevAngle = current;
    });

    return () => unsubscribe();
  }, [rotation, tickAngles, triggerPinShake]);

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

  const spin = () => {
    if (spinning) return;

    const totalBet = Object.values(bets).reduce(
      (sum, count) => sum + count * 10,
      0
    );
    if (totalBet === 0) {
      alert("최소 1개 이상 배팅해주세요!");
      return;
    }

    setSpinning(true);
    setResult(null);
    setSelectedSectors([]);

    const start = rotation.get();
    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const randomOffset = Math.random() * 180;
    const end = start + fullSpins * 360 + randomOffset;

    animate(rotation, [start, end], {
      duration: 10,
      ease: [0.33, 1, 0.68, 1],
      onComplete: () => {
        setSpinning(false);
        const normalized = ((end % 360) + 360) % 360;
        const pinAngle = (360 - normalized) % 360;
        const index = Math.floor(pinAngle / sectorAngle);
        const resultValue = sectors[index];
        setResult(resultValue);

        const matchingSectors = sectors.reduce((indices, sector, idx) => {
          if (sector === resultValue) {
            indices.push(idx);
          }
          return indices;
        }, [] as number[]);
        setSelectedSectors(matchingSectors);

        let winnings = 0;
        const isWin = bets[resultValue] > 0;
        if (isWin) {
          const betAmount = bets[resultValue] * 10;
          const baseMultiplier = parseInt(resultValue);
          const streakBonus = getStreakMultiplier(winStreak);

          if (streakBonus > 0) {
            if (streakBonus === 1) {
              winnings = betAmount + betAmount * (baseMultiplier + streakBonus);
            } else {
              winnings = betAmount + betAmount * baseMultiplier * streakBonus;
            }
          } else {
            winnings = betAmount + betAmount * baseMultiplier;
          }

          setScore(
            score + winnings,
            `${resultValue}배 당첨! (${streakBonus > 0 ? `연승 보너스 ${getStreakText(winStreak)} 적용` : ""})`
          );
        }

        // 히스토리에 기록 추가
        addHistory({
          bets: { ...bets },
          totalBet,
          result: resultValue,
          winAmount: isWin ? winnings : -totalBet,
          isWin,
        });

        // 연속 성공 횟수 업데이트
        updateWinStreak(isWin);

        setBets({
          "1": 0,
          "3": 0,
          "5": 0,
          "10": 0,
          "20": 0,
        });
      },
    });
  };

  const gradient = `conic-gradient(${sectors
    .map((s, i) => {
      const color = colorMap[s] || "#ccc";
      const start = ((i / sectorCount) * 100).toFixed(2);
      const end = (((i + 1) / sectorCount) * 100).toFixed(2);
      return `${color} ${start}% ${end}%`;
    })
    .join(", ")})`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[300px] h-[300px]">
        <motion.div
          className="absolute w-full h-full rounded-full border-4 border-black"
          style={{ background: gradient, rotate: rotation }}
        >
          {sectors.map((s, i) => {
            const angle = (360 / sectorCount) * (i + 0.5);
            const isSelected = selectedSectors.includes(i);
            return (
              <div
                key={i}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[14px] font-bold
                  ${isSelected ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "text-white"}`}
                style={{
                  transform: `rotate(${angle}deg) translateY(-120px)`,
                  whiteSpace: "nowrap",
                  textShadow: isSelected
                    ? "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)"
                    : "1px 1px 2px rgba(0,0,0,0.6)",
                }}
              >
                {s}
              </div>
            );
          })}
        </motion.div>

        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 
            border-l-[10px] border-r-[10px] border-t-[20px] 
            border-transparent border-t-black z-10"
          style={{
            rotate: shake,
            transformOrigin: "top center",
          }}
        />
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className={`
          relative px-6 py-3 text-lg font-bold rounded-xl shadow-lg
          transition-all duration-300 transform
          ${
            spinning
              ? "bg-gray-100 text-gray-400 cursor-not-allowed animate-pulse border-2 border-gray-200"
              : "bg-gradient-to-br from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 hover:scale-105 active:scale-95 border-2 border-amber-300"
          }
        `}
      >
        <div className="flex items-center gap-2">
          {spinning ? (
            <>
              <div className="animate-spin w-5 h-5 border-3 border-gray-300 border-t-gray-600 rounded-full" />
              회전 중...
            </>
          ) : (
            <>
              🎲 룰렛 돌리기
              <span className="text-amber-200 text-sm ml-1">GO!</span>
            </>
          )}
        </div>
        {!spinning && (
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-xl transition-opacity duration-300" />
        )}
      </button>

      {result && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className={`
            mt-4 px-6 py-3 rounded-xl font-bold text-xl
            flex items-center gap-3 shadow-lg
            ${parseInt(result) >= 10 ? "animate-bounce" : ""}
            ${
              parseInt(result) >= 20
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : parseInt(result) >= 10
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                  : parseInt(result) >= 5
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : parseInt(result) >= 3
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900"
            }
            border-2 border-opacity-50
            ${
              parseInt(result) >= 20
                ? "border-purple-300"
                : parseInt(result) >= 10
                  ? "border-orange-300"
                  : parseInt(result) >= 5
                    ? "border-blue-300"
                    : parseInt(result) >= 3
                      ? "border-green-300"
                      : "border-yellow-300"
            }
          `}
        >
          <span className="text-2xl">
            {parseInt(result) >= 20
              ? "🌟"
              : parseInt(result) >= 10
                ? "✨"
                : parseInt(result) >= 5
                  ? "💫"
                  : parseInt(result) >= 3
                    ? "⭐️"
                    : "🔸"}
          </span>
          <div className="flex flex-col items-start">
            <div className="text-sm opacity-75">룰렛 결과</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">{result}</span>
              <span className="text-base opacity-90">배</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="text-xl font-bold bg-amber-100 text-amber-800 px-4 py-2 rounded-xl border-2 border-amber-200 shadow-sm">
          🌾 남은 사료 {score}개 🥣
        </div>
        <div className="relative group">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl border-2 border-yellow-300 shadow-md overflow-hidden p-1">
            <div className="relative w-full h-full">
              <Image
                src={`/assets/characters/chick${characterLevel}.png`}
                alt={`Level ${characterLevel} character`}
                fill
                sizes="(max-width: 768px) 56px, 56px"
                className="object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110"
                priority
              />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-md border border-yellow-500 shadow-sm">
            Lv.{characterLevel}
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-bold text-yellow-800 whitespace-nowrap bg-yellow-100/90 px-2 py-0.5 rounded-full border border-yellow-200">
            {Math.min(characterLevel * 100, score)}점 달성!
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-lg items-center">
        <div className="font-bold text-green-600">연속 성공: {winStreak}회</div>
        {winStreak >= 3 && (
          <div className="animate-pulse text-orange-500 font-bold flex items-center gap-1">
            {Array(Math.min(3, Math.floor(winStreak / 3)))
              .fill("🔥")
              .join("")}
            Hot Streak x{winStreak}!
            <span className="ml-1 text-red-500">
              ({getStreakText(winStreak)} 보너스)
            </span>
          </div>
        )}
        <div className="font-bold text-purple-600">
          최고 기록: {bestWinStreak}회
        </div>
      </div>
      <BatPanel
        bets={bets}
        onBet={handleBet}
        onReset={resetBets}
        winningNumber={result}
        winStreak={winStreak}
      />
      <BettingHistory />
    </div>
  );
}
