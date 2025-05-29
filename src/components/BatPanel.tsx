"use client";

import React from "react";

type BetMap = Record<string, number>;

interface BetPanelProps {
  bets: BetMap;
  onBet: (value: string) => void;
  onReset: () => void;
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

export default function BetPanel({ bets, onBet, onReset }: BetPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 flex-wrap justify-center">
        {betOptions.map((value) => (
          <button
            key={value}
            onClick={() => onBet(value)}
            className={`px-3 py-2 bg-gray-100 rounded-lg shadow text-sm font-semibold w-20 transition-colors duration-200 cursor-pointer ${colorMap[value].hover} ${colorMap[value].active} hover:text-white active:text-white`}
          >
            {value} 배팅
            <br />({bets[value] * 10}점)
          </button>
        ))}
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
