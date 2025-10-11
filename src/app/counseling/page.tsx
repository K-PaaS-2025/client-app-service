"use client";

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default function CounselingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-900 mb-4">음성 상담</h1>
        <p className="text-amber-700">곧 출시됩니다...</p>
      </div>
    </div>
  );
}