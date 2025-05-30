"use client";

import BettingHistory from "@/components/BettingHistory";

export default function HistoryPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">배팅 기록</h1>
      <BettingHistory />
    </div>
  );
}
