"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; loginTime?: string } | null>(null);

  useEffect(() => {
    const userData = {
      email: "test@example.com",
      loginTime: new Date().toISOString()
    };
    setUser(userData);
  }, []);

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/icon.svg"
                alt="Client App Service"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold text-amber-900">Client App Service</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-amber-700 font-medium">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 환영 메시지 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/icon.svg"
              alt="Client App Service"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h2 className="text-3xl font-bold text-amber-900 mb-4">
            환영합니다!
          </h2>
          <p className="text-xl text-amber-700 mb-2">
            {user?.email}님
          </p>
        </div>

        {/* 3개 버튼 */}
        <div className="space-y-6">
          <button
            onClick={() => router.push('/daily-record')}
            className="w-full font-bold text-2xl py-8 px-6 rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            📝 오늘 하루 기록하기
          </button>

          <button
            onClick={() => router.push('/photo-capture')}
            className="w-full font-bold text-2xl py-8 px-6 rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            📷 사진 찍기
          </button>

          <button
            onClick={() => router.push('/counseling')}
            className="w-full font-bold text-2xl py-8 px-6 rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            🎤 AI 상담
          </button>
        </div>
      </main>
    </div>
  );
}