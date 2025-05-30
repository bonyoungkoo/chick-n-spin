"use client";

import { useGameStore } from "@/store/useGameStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BettingHistory() {
  const history = useGameStore((state) => state.history);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 h-64 bg-white/90 backdrop-blur rounded-lg shadow-lg p-4 overflow-hidden mb-2"
          >
            <h3 className="text-lg font-bold mb-2 text-gray-800">
              배팅 히스토리
            </h3>
            <div className="overflow-y-auto h-[calc(100%-2rem)] space-y-2 pr-2">
              {history.map((record) => (
                <div
                  key={record.timestamp}
                  className={`p-3 rounded-lg text-sm ${
                    record.isWin ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`font-bold ${
                        record.isWin ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {record.isWin ? "+" : "-"}
                      {Math.abs(record.winAmount)}점
                    </span>
                  </div>
                  <div className="text-gray-700">
                    배팅:{" "}
                    {Object.entries(record.bets)
                      .filter(([, amount]) => amount > 0)
                      .map(([value, amount]) => `${value}(${amount * 10}점)`)
                      .join(", ")}
                  </div>
                  {record.result && (
                    <div className="text-gray-700">결과: {record.result}</div>
                  )}
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center text-gray-500 mt-4">
                  아직 배팅 기록이 없습니다
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 bg-white rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors
          ${isOpen ? "bg-gray-100" : ""}`}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        히스토리 {isOpen ? "닫기" : "보기"}
      </motion.button>
    </div>
  );
}
