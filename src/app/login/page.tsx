"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/actions/auth.action";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(login, { status: 0, message: "" });


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/icon.svg"
              alt="로고"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">로그인</h1>
          <p className="text-lg text-amber-700">안전하고 편리한 서비스를 이용하세요</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
          <form action={formAction} className="space-y-6">
            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-amber-900 mb-3">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-6 py-4 text-lg border-2 border-amber-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 focus:outline-none transition-colors bg-amber-50"
                placeholder="your-email@example.com"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-lg font-semibold text-amber-900 mb-3">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full px-6 py-4 text-lg border-2 border-amber-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 focus:outline-none transition-colors bg-amber-50 pr-14"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {state.status !== 0 && state.message && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-center">
                {state.message}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={pending}
              className={`w-full font-bold text-xl py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg ${
                pending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-1"
              }`}
            >
              {pending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  <span>로그인 중...</span>
                </div>
              ) : (
                "로그인"
              )}
            </button>

            {/* 회원가입 링크 */}
            <div className="text-center">
              <p className="text-lg text-amber-700 mb-4">아직 계정이 없으신가요?</p>
              <Link
                href="/signup"
                className="text-amber-700 hover:text-amber-900 font-bold text-lg underline transition-colors"
              >
                회원가입하기
              </Link>
            </div>

            {/* 임시 홈 이동 버튼 */}
            <div className="text-center mt-6">
              <Link
                href="/home"
                className="inline-block w-full py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium text-lg rounded-xl transition-colors"
              >
                테스트용 홈으로 이동
              </Link>
            </div>
          </form>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-8">
          <p className="text-amber-700 text-base">
            © 2024 Client App Service. 모든 권리 보유.
          </p>
        </div>
      </div>
    </div>
  );
}