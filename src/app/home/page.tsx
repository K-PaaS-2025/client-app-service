"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ loginTime?: string } | null>(null);

  // 데모용: 10일째
  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d;
  }, []);
  const daysTogether = useMemo(() => {
    const diff = (Date.now() - startDate.getTime()) / 86400000;
    return Math.max(1, Math.floor(diff));
  }, [startDate]);

  const progress = 42; // 하트 마커 위치(0~100)

  useEffect(() => {
    setUser({ loginTime: new Date().toISOString() });
  }, []);

  const handleLogout = () => {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const dateLabel = useMemo(() => {
    const d = new Date();
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const day = d.toLocaleDateString("en-US", { day: "numeric" });
    return `${month} ${day}, ${weekday}`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* 상단 헤더 (배경 그대로) */}
      <header className="bg-white/90 backdrop-blur shadow-sm border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image src="/icon.svg" alt="토닥" width={36} height={36} className="rounded-lg" />
              <h1 className="text-xl font-bold text-amber-900">토닥: to-Dog</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 본문 카드만 새 디자인 */}
      <main className="w-full h-[calc(100vh-4rem)] bg-[#FBF6EE] px-6 sm:px-8 py-8 flex flex-col items-center overflow-y-auto shadow-inner">
        <div className="mx-auto max-w-md bg-[#FBF6EE] rounded-[28px] shadow-2xl px-6 sm:px-8 py-6 border border-amber-100">
          {/* 날짜 */}
          <p className="text-sm text-amber-700/80 mb-4">{dateLabel}</p>
          <hr className="border-amber-100" />

          {/* 마스코트 & 함께한지 */}
          <div className="mt-6 grid grid-cols-[110px_1fr] gap-3 items-center">
            <div className="relative w-[110px] h-[110px]">
              <Image
                src="/monster.png"
                alt="마스코트"
                fill
                className="object-contain"
                onError={(e) => {
                  const parent = (e.target as HTMLImageElement).parentElement as HTMLElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="w-full h-full rounded-full bg-amber-100 grid place-items-center text-4xl">👾</div>';
                  }
                }}
              />
            </div>
            <div className="pl-2">
              <div className="text-2xl font-bold text-amber-900">함께한지</div>
              <div className="mt-1 text-4xl font-extrabold text-amber-900">
                {daysTogether}
                <span className="text-2xl font-semibold ml-1">일째</span>
              </div>
            </div>
          </div>

          {/* 진행바 + 하트 */}
          <div className="mt-5">
            <div className="relative">
              <div className="h-3 rounded-full bg-[#e9e2d3]" />
              <div
                className="absolute top-0 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute -top-3" style={{ left: `calc(${progress}% - 12px)` }} aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" className="drop-shadow">
                  <path
                    d="M12 21s-6.716-4.19-9.428-8.03C.78 10.23 2.08 6.5 5.35 6.5c1.76 0 3.01.98 3.9 2.1.89-1.12 2.14-2.1 3.9-2.1 3.27 0 4.57 3.73 2.78 6.47C18.716 16.81 12 21 12 21z"
                    fill="#fff"
                    stroke="#1f2937"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 21s-6.716-4.19-9.428-8.03C.78 10.23 2.08 6.5 5.35 6.5c1.76 0 3.01.98 3.9 2.1.89-1.12 2.14-2.1 3.9-2.1 3.27 0 4.57 3.73 2.78 6.47C18.716 16.81 12 21 12 21z"
                    fill="url(#g)"
                  />
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="24" y2="24">
                      <stop stopColor="#f59e0b" />
                      <stop offset="1" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-amber-800">첫 만남</div>
          </div>

          {/* 질문 라벨 */}
          <div className="mt-8">
            <button
              onClick={() => router.push("/animal-letter")}
              className="w-full text-center text-amber-900/90 font-semibold bg-white/60 hover:bg-white/80 rounded-2xl py-3 transition-colors cursor-pointer"
            >
              오늘 하루는 어떠셨나요?
            </button>
          </div>

          {/* 버튼 3개 */}
          <div className="mt-5 space-y-4">
            <button
              onClick={() => router.push("/daily-record")}
              className="w-full text-left flex items-center gap-3 px-6 py-6 rounded-2xl bg-[#C5965E] hover:bg-[#e4dcff] transition-colors shadow-sm"
            >
              <span className="text-2xl">📝</span>
              <span className="text-xl font-semibold text-gray-800">오늘 하루 기록하기</span>
            </button>

            <button
              onClick={() => router.push("/photo-capture")}
              className="w-full text-left flex items-center gap-3 px-6 py-6 rounded-2xl bg-[#C5965E] hover:bg-[#e4dcff] transition-colors shadow-sm"
            >
              <span className="text-2xl">📷</span>
              <span className="text-xl font-semibold text-gray-800">사진 찍기</span>
            </button>

            <button
              onClick={() => router.push("/counseling")}
              className="w-full text-left flex items-center gap-3 px-6 py-6 rounded-2xl bg-[#C5965E] hover:bg-[#e4dcff] transition-colors shadow-sm"
            >
              <span className="text-2xl">🎤</span>
              <span className="text-xl font-semibold text-gray-800">질문하기</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
