"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; loginTime?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 테스트용 더미 데이터
    const userData = {
      email: "test@example.com",
      loginTime: new Date().toISOString()
    };
    setUser(userData);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    auth.logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 환영 메시지 */}
        <div className="bg-white rounded-3xl shadow-lg border border-amber-200 p-8 mb-8">
          <div className="text-center">
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
            <p className="text-lg text-amber-600">
              안전하고 편리한 서비스를 이용하세요
            </p>
          </div>
        </div>

        {/* 서비스 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-amber-900 text-center mb-2">프로필 관리</h3>
            <p className="text-amber-700 text-center">개인정보 및 계정 설정을 관리하세요</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-amber-900 text-center mb-2">문서 관리</h3>
            <p className="text-amber-700 text-center">중요한 문서를 안전하게 보관하세요</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-amber-900 text-center mb-2">고객 지원</h3>
            <p className="text-amber-700 text-center">궁금한 점이 있으시면 언제든 문의하세요</p>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-3xl shadow-lg border border-amber-200 p-8">
          <h3 className="text-2xl font-bold text-amber-900 mb-6">최근 활동</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-2xl">
              <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-amber-900 font-medium">로그인</p>
                <p className="text-amber-600 text-sm">
                  {user?.loginTime ? new Date(user.loginTime).toLocaleString('ko-KR') : '방금 전'}
                </p>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-amber-600">다른 활동이 없습니다</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}