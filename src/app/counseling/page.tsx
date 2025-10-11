"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { counselingAPI } from "@/api/counseling";

type CounselingState = 'permission' | 'idle' | 'recording' | 'processing' | 'playing';

export const dynamic = 'force-dynamic';

export default function CounselingPage() {
  const router = useRouter();
  const [state, setState] = useState<CounselingState>('permission');
  const [isClient, setIsClient] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messageCount, setMessageCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 마이크 권한 요청
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setState('idle');
    } catch (error) {
      console.error('마이크 권한 거부:', error);
    }
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setState('processing');

        // 녹음된 오디오를 Blob으로 변환
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });

        // API로 음성 전송
        try {
          const response = await counselingAPI.sendVoiceMessage(audioBlob, sessionId);

          if (response.success && response.data) {
            // 세션 ID 업데이트
            if (response.data.session_id) {
              setSessionId(response.data.session_id);
            }

            // AI 응답 재생
            setState('playing');
            await counselingAPI.playAudioFromBase64(response.data.assistant_audio_base64);

            // 메시지 카운트 증가
            setMessageCount(prev => prev + 1);
            setState('idle');
          } else {
            console.error('API 응답 실패:', response.message);
            setState('idle');
          }
        } catch (error) {
          console.error('음성 전송 실패:', error);
          setState('idle');
        }
      };

      mediaRecorder.start();
      setState('recording');
    } catch (error) {
      console.error('녹음 실패:', error);
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/icon.svg"
              alt="Client App Service"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">AI 상담</h1>
          <p className="text-lg text-amber-700">음성으로 AI 상담사와 대화하세요</p>
        </div>

        {/* 상담 상태 표시 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200 mb-6">
          <div className="text-center">
            {/* 상태 아이콘 */}
            <div className="w-32 h-32 mx-auto mb-6">
              <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${
                state === 'recording' ? 'bg-red-100 animate-pulse border-4 border-red-300' :
                state === 'processing' ? 'bg-yellow-100' :
                state === 'playing' ? 'bg-blue-100 animate-pulse' :
                state === 'idle' ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                {state === 'recording' && (
                  <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                )}
                {state === 'processing' && (
                  <svg className="w-12 h-12 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {state === 'playing' && (
                  <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
                {(state === 'idle' || state === 'permission') && (
                  <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
            </div>

            {/* 상태 텍스트 */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                {state === 'permission' && '마이크 권한 필요'}
                {state === 'idle' && '대화 준비'}
                {state === 'recording' && '녹음 중...'}
                {state === 'processing' && 'AI가 분석 중...'}
                {state === 'playing' && 'AI 응답 재생 중...'}
              </h2>
              <p className="text-amber-700">
                {state === 'permission' && '음성 상담을 위해 마이크 권한을 허용해주세요'}
                {state === 'idle' && '말하기 버튼을 눌러 상담을 시작하세요'}
                {state === 'recording' && '말씀이 끝나면 중지 버튼을 눌러주세요'}
                {state === 'processing' && '음성을 분석하고 AI 응답을 생성하고 있습니다'}
                {state === 'playing' && 'AI 상담사의 응답을 들어보세요'}
              </p>
            </div>

            {/* 대화 횟수 */}
            {messageCount > 0 && (
              <div className="mb-6">
                <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-lg font-medium">
                  대화 횟수: {messageCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-amber-200">
          <div className="flex flex-col space-y-4">
            {state === 'permission' && (
              <button
                onClick={requestMicrophonePermission}
                className="w-full font-bold text-xl py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🎤 마이크 권한 허용
              </button>
            )}

            {state === 'idle' && (
              <button
                onClick={startRecording}
                className="w-full font-bold text-xl py-4 px-6 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🎤 말하기 시작
              </button>
            )}

            {state === 'recording' && (
              <button
                onClick={stopRecording}
                className="w-full font-bold text-xl py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ⏹️ 녹음 중지
              </button>
            )}

            {/* 진행 중일 때는 버튼 비활성화 */}
            {(state === 'processing' || state === 'playing') && (
              <div className="w-full font-bold text-xl py-4 px-6 rounded-2xl bg-gray-300 text-gray-500 text-center">
                {state === 'processing' ? '⏳ 처리 중...' : '🔊 재생 중...'}
              </div>
            )}

            <button
              onClick={() => router.push("/home")}
              className="w-full text-amber-600 hover:text-amber-700 font-medium text-lg underline transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}