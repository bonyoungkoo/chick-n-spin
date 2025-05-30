"use client";

import { useGameStore } from "@/store/useGameStore";
import Image from "next/image";

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function HistoryPage() {
  const { growthHistory } = useGameStore();

  return (
    <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">🐣 성장 일지 📝</h1>

      <div className="w-full space-y-4">
        {growthHistory.map((record, index) => (
          <div
            key={record.timestamp}
            className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl border-2 border-yellow-300 p-2">
                <Image
                  src={`/chick-n-spin/assets/characters/chick${record.level}.png`}
                  alt={`Level ${record.level} character`}
                  fill
                  className="object-contain drop-shadow-md"
                  priority={index < 3}
                />
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">
                  {formatDate(record.timestamp)}
                </div>

                <div className="font-medium text-gray-700">
                  {record.type === "increase" ? (
                    <span className="text-green-600">
                      🔼 사료가 {record.score - record.previousScore}개
                      증가했어요!
                    </span>
                  ) : (
                    <span className="text-red-600">
                      🔽 사료가 {record.previousScore - record.score}개
                      감소했어요.
                    </span>
                  )}
                </div>

                {record.level !== record.previousLevel && (
                  <div className="mt-1 text-sm">
                    {record.level > record.previousLevel ? (
                      <span className="text-yellow-600 font-semibold">
                        ⭐️ Level {record.previousLevel} → {record.level} 성장!
                      </span>
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        💫 Level {record.previousLevel} → {record.level}
                      </span>
                    )}
                  </div>
                )}

                {record.reason && (
                  <div className="text-sm text-gray-500 mt-1">
                    {record.reason}
                  </div>
                )}
              </div>

              <div className="text-right text-lg font-bold text-amber-800">
                🌾 {record.score}개
              </div>
            </div>
          </div>
        ))}

        {growthHistory.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            아직 기록이 없어요! 게임을 플레이해서 병아리를 성장시켜보세요 🐣
          </div>
        )}
      </div>
    </div>
  );
}
