"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AnimalLetterPage() {
  const router = useRouter();

  const mockLetterData = {
    animalType: "강아지",
    animalName: "몽이",
    date: "2024년 10월 31일",
    letter: `안녕하세요! 저는 몽이에요 🐕

오늘 하루 정말 수고 많으셨어요!
당신의 마음이 조금 무거워 보이는 것 같아서,
제가 따뜻한 편지를 써드리고 싶었어요.

힘든 일이 있으셨나요?
저는 항상 당신 곁에 있으니까
언제든지 저에게 마음을 털어놓으셔도 돼요.

내일은 분명 더 좋은 하루가 될 거예요!
우리 함께 힘내봐요! 💪✨

사랑을 담아서,
몽이 올림 🐾`,
    mood: "따뜻함",
    keywords: ["위로", "격려", "동반자"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* 상단 헤더 */}
      <header className="bg-white/90 backdrop-blur shadow-sm border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-900"
            >
              <span className="text-xl">←</span>
              <span className="font-semibold">뒤로</span>
            </button>
            <h1 className="text-xl font-bold text-amber-900">동물친구의 편지</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="w-full min-h-[calc(100vh-4rem)] bg-[#FBF6EE] px-6 sm:px-8 py-8 flex flex-col items-center">
        <div className="mx-auto max-w-lg bg-[#FBF6EE] rounded-[28px] shadow-2xl px-6 sm:px-8 py-8 border border-amber-100">

          {/* 동물 프로필 */}
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-amber-100 grid place-items-center text-4xl">
                🐕
              </div>
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-1">{mockLetterData.animalName}</h2>
            <p className="text-sm text-amber-700/80">{mockLetterData.animalType} • {mockLetterData.date}</p>
          </div>

          {/* 편지 내용 */}
          <div className="bg-white/60 rounded-2xl p-6 mb-6">
            <div className="whitespace-pre-line text-amber-900/90 leading-relaxed">
              {mockLetterData.letter}
            </div>
          </div>

          {/* 분석 정보 */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white mb-6">
            <h3 className="text-lg font-semibold mb-3">💫 감정 분석</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>오늘의 기분:</span>
                <span className="font-semibold">{mockLetterData.mood}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>키워드:</span>
                <div className="flex gap-1">
                  {mockLetterData.keywords.map((keyword, index) => (
                    <span key={index} className="bg-white/20 px-2 py-1 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/home")}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-2xl transition-colors"
            >
              홈으로 돌아가기
            </button>

            <button
              onClick={() => router.push("/daily-record")}
              className="w-full py-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-2xl transition-colors"
            >
              새로운 기록 작성하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}