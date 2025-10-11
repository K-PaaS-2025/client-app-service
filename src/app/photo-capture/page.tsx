"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CameraState = 'permission' | 'ready' | 'captured' | 'sending' | 'result';

interface PhotoResponse {
  imageUrl: string;
  text: string;
}

export const dynamic = 'force-dynamic';

export default function PhotoCapturePage() {
  const router = useRouter();
  const [state, setState] = useState<CameraState>('permission');
  const [isClient, setIsClient] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [photoResult, setPhotoResult] = useState<PhotoResponse | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 페이지 로드 시 권한 상태 확인 및 자동 카메라 시작
  useEffect(() => {
    if (isClient) {
      checkCameraPermission();
    }
  }, [isClient]);

  // 카메라 권한 상태 확인
  const checkCameraPermission = async () => {
    try {
      // navigator.permissions API로 권한 상태 확인
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('카메라 권한 상태:', result.state);

        if (result.state === 'granted') {
          // 권한이 이미 허용되어 있으면 자동으로 카메라 시작
          console.log('권한이 이미 허용됨, 자동으로 카메라 시작');
          requestCameraPermission();
        } else if (result.state === 'denied') {
          console.log('권한이 거부됨, 수동 요청 필요');
          setState('permission');
        } else {
          console.log('권한 상태 불명, 수동 요청 필요');
          setState('permission');
        }
      } else {
        // permissions API가 지원되지 않으면 직접 시도
        console.log('permissions API 미지원, 직접 카메라 시도');
        try {
          await requestCameraPermission();
        } catch {
          setState('permission');
        }
      }
    } catch (error) {
      console.log('권한 확인 실패, 수동 요청 필요:', error);
      setState('permission');
    }
  };

  // 카메라 권한 요청 및 스트림 시작
  const requestCameraPermission = async () => {
    try {
      console.log('카메라 권한 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // 후면 카메라 우선
        }
      });

      console.log('카메라 스트림 획득 성공:', stream);
      streamRef.current = stream;

      // 먼저 상태를 ready로 변경해서 video 요소가 렌더링되도록 함
      setState('ready');

      // video 요소가 렌더링될 때까지 조금 기다린 후 스트림 설정
      setTimeout(() => {
        if (videoRef.current) {
          console.log('비디오 요소에 스트림 설정 중...');
          videoRef.current.srcObject = stream;

          // 비디오가 로드될 때까지 대기
          videoRef.current.onloadedmetadata = () => {
            console.log('비디오 메타데이터 로드 완료');
            // 이미 ready 상태이므로 추가 상태 변경 불필요
          };
        } else {
          console.error('비디오 ref가 여전히 null입니다');
        }
      }, 100);

    } catch (error) {
      console.error('카메라 권한 거부 또는 오류:', error);
      // 권한이 거부되어도 테스트를 위해 ready 상태로 변경
      setState('ready');
    }
  };

  // 사진 촬영
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        setState('captured');

        // 카메라 스트림 중지
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  // 다시 찍기
  const retakePhoto = () => {
    setCapturedImage('');
    setState('permission');
  };

  // 사진 전송
  const sendPhoto = async () => {
    if (!capturedImage) return;

    setState('sending');

    try {
      // base64 이미지를 blob으로 변환
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // FormData 생성
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');

      // API 호출 (실제 API 엔드포인트로 변경 필요)
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/photo/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        setPhotoResult(result);
        setState('result');
      } else {
        throw new Error('사진 업로드 실패');
      }
    } catch (error) {
      console.error('사진 전송 실패:', error);
      // 임시로 더미 데이터 표시
      setPhotoResult({
        imageUrl: capturedImage,
        text: '사진 분석 결과: 아름다운 사진입니다! (API 연결 필요)'
      });
      setState('result');
    }
  };

  // 새로운 사진 촬영
  const takeNewPhoto = () => {
    setCapturedImage('');
    setPhotoResult(null);
    setState('permission');
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
          <h1 className="text-3xl font-bold text-amber-900 mb-2">사진 찍기</h1>
          <p className="text-lg text-amber-700">카메라로 사진을 촬영해보세요</p>
        </div>

        {/* 카메라 및 사진 표시 영역 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-amber-200 mb-6">
          <div className="text-center">
            {/* 상태별 표시 */}
            {state === 'permission' && (
              <div className="py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-amber-900 mb-2">카메라 권한 필요</h2>
                <p className="text-amber-700 mb-6">사진 촬영을 위해 카메라 권한을 허용해주세요</p>
                <button
                  onClick={requestCameraPermission}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  📷 카메라 권한 허용
                </button>
              </div>
            )}

            {state === 'ready' && (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-2xl mb-4"
                  style={{ maxHeight: '400px' }}
                />
                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto transition-colors shadow-lg"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15.2l3.536-3.536 1.414 1.414L12 17.828 7.05 12.878l1.414-1.414L12 15.2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            )}

            {state === 'captured' && (
              <div>
                <img
                  src={capturedImage}
                  alt="촬영된 사진"
                  className="w-full rounded-2xl mb-4"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={retakePhoto}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                  >
                    다시 찍기
                  </button>
                  <button
                    onClick={sendPhoto}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    보내기
                  </button>
                </div>
              </div>
            )}

            {state === 'sending' && (
              <div className="py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-amber-900 mb-2">전송 중...</h2>
                <p className="text-amber-700">사진을 분석하고 있습니다</p>
              </div>
            )}

            {state === 'result' && photoResult && (
              <div>
                <img
                  src={photoResult.imageUrl}
                  alt="업로드된 사진"
                  className="w-full rounded-2xl mb-4"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
                <div className="bg-amber-50 rounded-2xl p-4 mb-4">
                  <h3 className="text-lg font-bold text-amber-900 mb-2">분석 결과</h3>
                  <p className="text-amber-800">{photoResult.text}</p>
                </div>
                <button
                  onClick={takeNewPhoto}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                >
                  새로운 사진 촬영
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="text-center">
          <button
            onClick={() => router.push("/home")}
            className="text-amber-600 hover:text-amber-700 font-medium text-lg underline transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* 숨겨진 캔버스 */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}