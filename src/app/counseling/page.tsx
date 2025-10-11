"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { counselingAPI } from "@/api/counseling";

type CounselingState = 'permission' | 'idle' | 'recording' | 'processing' | 'playing';

export default function CounselingPage() {
  const router = useRouter();
  const [state, setState] = useState<CounselingState>('permission');
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [messageCount, setMessageCount] = useState(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 모바일 환경 감지 및 권한 확인 (클라이언트에서만)
  useEffect(() => {
    if (!isClient) return;

    // 모바일 환경 감지
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileCheck = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(mobileCheck);
    };

    // 기존 권한 상태 확인 (안전한 체크)
    const checkPermissions = async () => {
      // 브라우저 API 존재 여부 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('MediaDevices API 지원하지 않음');
        return;
      }

      try {
        // 기존에 권한이 있는지 간단히 확인
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // 권한이 있다면 바로 idle 상태로 변경
        setMicPermissionGranted(true);
        setState('idle');
        // 즉시 스트림 중지
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        // 권한이 없다면 permission 상태 유지
        console.log('권한 확인 실패:', error);
      }
    };

    checkMobile();
    checkPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isClient]);

  // 마이크 권한 요청 (안전한 클라이언트 체크)
  const requestMicrophonePermission = async () => {
    setError("");

    // 1. 브라우저 환경 확인
    if (typeof window === 'undefined') {
      setError('서버에서 실행 중입니다. 클라이언트에서 시도해주세요.');
      return;
    }

    // 2. navigator 존재 확인
    if (typeof navigator === 'undefined') {
      setError('Navigator API를 사용할 수 없습니다.');
      return;
    }

    // 3. mediaDevices 존재 확인
    if (!navigator.mediaDevices) {
      setError('MediaDevices API를 지원하지 않는 브라우저입니다.');
      return;
    }

    // 4. getUserMedia 존재 확인
    if (!navigator.mediaDevices.getUserMedia) {
      setError('getUserMedia API를 지원하지 않는 브라우저입니다.');
      return;
    }

    try {
      // 5. 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log('Microphone access granted:', stream);

      streamRef.current = stream;
      setMicPermissionGranted(true);
      setMicActive(true);
      setState('idle');

      // 스트림 정리
      stream.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setMicActive(false);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
      // 권한 실패 시 파일 업로드 대안 제공
      setShowFileUpload(true);
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 오디오 파일 검증
    if (!file.type.startsWith('audio/')) {
      setError('오디오 파일만 업로드 가능합니다.');
      return;
    }

    setError("");
    setState('processing');

    try {
      // 파일을 Blob으로 변환 후 API 전송
      const audioBlob = new Blob([file], { type: file.type });
      await sendAudioToAPI(audioBlob);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('파일 업로드 중 오류가 발생했습니다.');
      setState('idle');
    }
  };

  // MediaRecorder 초기화 (안전한 클라이언트 체크)
  const initializeRecording = async () => {
    // 브라우저 환경 체크
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('브라우저에서 마이크 API를 지원하지 않습니다.');
      return false;
    }

    try {
      // 녹음용 스트림 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToAPI(audioBlob);
      };

      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('마이크 접근 권한이 필요합니다.');
      return false;
    }
  };

  // 녹음 시작
  const startRecording = async () => {
    setError("");

    if (!mediaRecorderRef.current) {
      const initialized = await initializeRecording();
      if (!initialized) return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setMicActive(true);
      setState('recording');
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setMicActive(false);
      setState('processing');
    }
  };

  // 오디오를 API로 전송
  const sendAudioToAPI = async (audioBlob: Blob) => {
    try {
      const response = await counselingAPI.sendVoiceMessage(audioBlob, sessionId);

      if (response.success && response.data) {
        // 세션 ID 저장
        if (response.data.session_id) {
          setSessionId(response.data.session_id);
        }

        // 응답 오디오 재생
        setState('playing');
        await counselingAPI.playAudioFromBase64(response.data.assistant_audio_base64);

        setMessageCount(prev => prev + 1);

        // 상담 완료 체크
        if (response.data.is_complete) {
          // 상담 완료 후 홈으로 이동
          setTimeout(() => {
            router.push("/home");
          }, 1000);
        } else {
          // 계속 상담 진행
          setState('idle');
        }
      } else {
        setError(response.message || "음성 전송 중 오류가 발생했습니다.");
        setState('idle');
      }
    } catch (err) {
      console.error('Error sending audio:', err);
      setError("음성 전송 중 오류가 발생했습니다.");
      setState('idle');
    }
  };

  // 상담 시작
  const startCounseling = async () => {
    await startRecording();
  };

  // 상담 중단
  const endCounseling = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    router.push("/home");
  };

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
          <h1 className="text-3xl font-bold text-amber-900 mb-2">초기 상담</h1>
          <p className="text-lg text-amber-700">AI 상담사와 음성으로 대화를 나누세요</p>
        </div>

        {/* 상담 상태 표시 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200 mb-6">
          <div className="text-center">
            {/* 상태 아이콘 */}
            <div className="w-32 h-32 mx-auto mb-6 relative">
              {/* 마이크 활성 상태 표시 */}
              {micActive && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              )}
              <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${
                state === 'recording'
                  ? 'bg-red-100 animate-pulse border-4 border-red-300'
                  : state === 'processing'
                  ? 'bg-yellow-100'
                  : state === 'playing'
                  ? 'bg-blue-100 animate-pulse'
                  : micPermissionGranted
                  ? 'bg-green-100'
                  : 'bg-amber-100'
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
                {state === 'idle' && (
                  <svg className={`w-12 h-12 ${micPermissionGranted ? 'text-green-600' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
                {state === 'permission' && (
                  <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
            </div>

            {/* 상태 텍스트 */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                {state === 'permission' && (isClient && isMobile ? '📱 모바일 마이크 권한 필요' : '마이크 권한 필요')}
                {state === 'idle' && '대화 준비'}
                {state === 'recording' && '녹음 중...'}
                {state === 'processing' && '분석 중...'}
                {state === 'playing' && 'AI 응답 재생 중...'}
              </h2>
              <p className="text-amber-700">
                {state === 'permission' && (isClient && isMobile ? '모바일에서 음성 상담을 위해 마이크 권한을 허용해주세요' : '음성 상담을 위해 마이크 권한을 허용해주세요')}
                {state === 'idle' && '말하기 버튼을 눌러 상담을 시작하세요'}
                {state === 'recording' && '말씀이 끝나면 중지 버튼을 눌러주세요'}
                {state === 'processing' && '음성을 분석하고 있습니다'}
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

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-center mb-6">
            {error}
          </div>
        )}

        {/* 컨트롤 버튼 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-amber-200">
          <div className="flex flex-col space-y-4">
            {state === 'permission' && (
              <button
                onClick={() => {
                  // 클라이언트에서만 실행되도록 확인
                  if (typeof window !== 'undefined' && isClient) {
                    requestMicrophonePermission();
                  } else {
                    console.error('클라이언트가 아닌 환경에서 버튼 클릭됨');
                  }
                }}
                disabled={!isClient}
                className={`w-full font-bold text-xl py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg ${
                  isClient
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isClient && isMobile ? '📱 모바일 마이크 권한 허용' : '🎤 마이크 권한 허용'}
              </button>
            )}

            {/* 파일 업로드 대안 (권한 실패 시) */}
            {showFileUpload && state === 'permission' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-amber-700 text-sm mb-3">
                    마이크 권한을 사용할 수 없습니다. 대신 음성 파일을 업로드해주세요.
                  </p>
                  <label className="w-full inline-block">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-full font-bold text-xl py-4 px-6 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
                      📁 음성 파일 업로드
                    </div>
                  </label>
                </div>
                <button
                  onClick={() => setShowFileUpload(false)}
                  className="w-full text-amber-600 hover:text-amber-700 text-sm underline"
                >
                  다시 마이크 권한 시도하기
                </button>
              </div>
            )}

            {state === 'idle' && (
              <button
                onClick={startCounseling}
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
                ⏹️ 말하기 완료
              </button>
            )}

            {(state === 'processing' || state === 'playing') && (
              <button
                disabled
                className="w-full font-bold text-xl py-4 px-6 rounded-2xl bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                {state === 'processing' ? '처리 중...' : '재생 중...'}
              </button>
            )}

            {/* 상담 종료 버튼 */}
            <button
              onClick={endCounseling}
              className="w-full font-bold text-lg py-3 px-6 rounded-2xl bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
            >
              상담 종료
            </button>
          </div>
        </div>

        {/* 사용 안내 */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mt-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 사용 안내</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• {isClient && isMobile ? '모바일에서 ' : ''}마이크 권한을 먼저 허용해주세요</li>
            <li>• 마이크가 안 되면 📁 파일 업로드로 음성 파일을 올릴 수 있습니다</li>
            <li>• 🟢 초록색 표시등이 마이크 활성 상태를 나타냅니다</li>
            <li>• 말하기 시작 버튼을 눌러 녹음을 시작하세요</li>
            <li>• 말씀이 끝나면 말하기 완료 버튼을 눌러주세요</li>
            <li>• AI가 응답을 재생한 후 자동으로 다음 녹음 준비가 됩니다</li>
            <li>• 상담이 완료되면 자동으로 홈 화면으로 이동합니다</li>
          </ul>
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