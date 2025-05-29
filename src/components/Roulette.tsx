"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import BatPanel from "./BatPanel";

const sectors = [
  "1",
  "3",
  "5",
  "1",
  "3",
  "1",
  "10",
  "1",
  "3",
  "5",
  "1",
  "3",
  "1",
  "5",
  "1",
  "3",
  "10",
  "1",
  "3",
  "20",
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
  const [bets, setBets] = useState<Record<string, number>>({
    "1": 0,
    "3": 0,
    "5": 0,
    "10": 0,
    "20": 0,
  });

  const handleBet = (value: string) => {
    setBets((prev) => ({
      ...prev,
      [value]: prev[value] + 1,
    }));
  };

  const resetBets = () => {
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
  }, []);

  // motion value 추가
  const shake = useMotionValue(0);

  // 핀이 경계선을 통과할 때 호출
  function triggerPinShake() {
    shake.set(8); // 오른쪽으로 순간 튐
    animate(shake, -8, { duration: 0.2 }).then(() =>
      animate(shake, 0, { duration: 0.1 })
    );
  }

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const start = rotation.get();
    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const randomOffset = Math.random() * 180;
    const end = start + fullSpins * 360 + randomOffset;

    animate(rotation, [start, end], {
      duration: 10,
      ease: [0.33, 1, 0.68, 1],
      onComplete: () => {
        setSpinning(false);
        const normalized = ((end % 360) + 360) % 360; // 0 ~ 359
        const pinAngle = (360 - normalized) % 360; // 상단(핀 위치) 기준 각도
        const index = Math.floor(pinAngle / sectorAngle); // 딱 떨어지는 섹터
        setResult(sectors[index]);
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
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[14px] font-bold"
                style={{
                  transform: `rotate(${angle}deg) translateY(-120px)`,
                  whiteSpace: "nowrap",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
                  color: "white",
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
      <BatPanel bets={bets} onBet={handleBet} onReset={resetBets} />
    </div>
  );
}
