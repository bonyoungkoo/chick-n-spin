"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import BatPanel from "./BatPanel";
import { useGameStore } from "@/store/useGameStore";
import BettingHistory from "./BettingHistory";

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
  "1": "#e8b334",
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

  const { score, setScore, addHistory } = useGameStore();

  const handleBet = (value: string) => {
    if (spinning) return;
    if (score >= 10) {
      setBets((prev) => ({
        ...prev,
        [value]: prev[value] + 1,
      }));
      setScore(score - 10);
      if (value === result) {
        setResult(null);
      }
    } else {
      alert("배팅할 점수가 부족합니다!");
    }
  };

  const resetBets = () => {
    const totalBets = Object.values(bets).reduce(
      (sum, count) => sum + count * 10,
      0
    );
    setScore(score + totalBets);
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

  const shake = useMotionValue(0);

  function triggerPinShake() {
    const offset = 8;
    shake.set(offset);
    animate(shake, -offset, { duration: 0.1 }).then(() =>
      animate(shake, 0, { duration: 0.1 })
    );
  }

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
          winnings = betAmount + betAmount * parseInt(resultValue);
          setScore(score + winnings);
        }

        // 히스토리에 기록 추가
        addHistory({
          bets: { ...bets },
          totalBet,
          result: resultValue,
          winAmount: isWin ? winnings : -totalBet,
          isWin,
        });

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
        className="px-4 py-2 bg-blue-500 text-white rounded-xl"
      >
        {spinning ? "회전 중..." : "룰렛 돌리기"}
      </button>

      {result && (
        <div className="mt-4 text-xl font-bold text-gray-800">
          결과: {result}
        </div>
      )}
      <div className="text-xl font-bold text-blue-600">현재 점수: {score}</div>
      <BatPanel
        bets={bets}
        onBet={handleBet}
        onReset={resetBets}
        winningNumber={result}
      />
      <BettingHistory />
    </div>
  );
}
