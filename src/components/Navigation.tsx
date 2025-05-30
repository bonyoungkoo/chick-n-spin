"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-center space-x-8 py-4">
          <Link
            href="/"
            className={`text-lg font-semibold transition-colors duration-200 ${
              pathname === "/"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            룰렛
          </Link>
          <Link
            href="/history"
            className={`text-lg font-semibold transition-colors duration-200 ${
              pathname === "/history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            기록
          </Link>
        </div>
      </div>
    </nav>
  );
}
