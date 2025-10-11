"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 테스트를 위해 바로 홈으로 리다이렉트
    router.push("/home");
  }, [router]);

  // 로딩 화면 (세션 확인 중)
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/icon.svg"
            alt="Client App Service"
            width={120}
            height={120}
            className="rounded-3xl shadow-xl animate-pulse"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-amber-900 mb-4">Client App Service</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </div>
    </div>
  );
}
