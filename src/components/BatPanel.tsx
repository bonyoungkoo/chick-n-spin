"use client";

import React from "react";

type BetMap = Record<string, number>;

interface BetPanelProps {
  bets: BetMap;
  onBet: (value: string) => void;
  onReset: () => void;
}

const betOptions = ["1", "3", "5", "10", "20"];

export default function BetPanel({ bets, onBet, onReset }: BetPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 flex-wrap justify-center">
        {betOptions.map((value) => (
          <button
            key={value}
            onClick={() => onBet(value)}
            className="px-3 py-2 bg-gray-100 hover:bg-blue-200 rounded-lg shadow text-sm font-semibold w-20"
          >
            {value} 배팅
            <br />({bets[value]})
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
          .filter(([_, count]) => count > 0)
          .map(([value, count]) => (
            <div key={value}>
              {value}에 {count}회 배팅함
            </div>
          ))}
        {Object.values(bets).every((c) => c === 0) && <div>아직 배팅 없음</div>}
      </div>
    </div>
  );
}
