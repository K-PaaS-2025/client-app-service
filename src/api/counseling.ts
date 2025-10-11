// 초기상담 관련 API

export interface CounselingStatus {
  hasInitialCounseling: boolean;
  counselingDate?: string;
  counselingId?: string;
}

export interface VoiceCounselingResponse {
  assistant_audio_base64: string;
  session_id?: string;
  is_complete?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class CounselingAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // 초기상담 여부 확인
  async checkCounselingStatus(): Promise<ApiResponse<CounselingStatus>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/counseling/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to check counseling status');
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error checking counseling status:', error);
      return {
        success: false,
        message: '상담 상태 확인 중 오류가 발생했습니다.'
      };
    }
  }

  // 음성 상담 진행 (녹음 파일 전송 및 응답 받기)
  async sendVoiceMessage(audioBlob: Blob, sessionId?: string): Promise<ApiResponse<VoiceCounselingResponse>> {
    try {
      // Blob을 base64로 변환
      const audioBase64 = await this.blobToBase64(audioBlob);

      const requestBody = {
        user_audio_base64: audioBase64,
        session_id: sessionId
      };

      const response = await fetch(`${this.baseUrl}/api/counseling/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to send voice message');
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error sending voice message:', error);
      return {
        success: false,
        message: '음성 메시지 전송 중 오류가 발생했습니다.'
      };
    }
  }

  // Blob을 base64로 변환하는 헬퍼 함수
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // "data:audio/wav;base64," 부분을 제거하고 base64 데이터만 추출
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // base64 오디오를 재생하는 헬퍼 함수
  playAudioFromBase64(base64Audio: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // base64를 blob으로 변환
        const byteCharacters = atob(base64Audio);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/wav' });

        // 오디오 객체 생성 및 재생
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);

        audio.onended = () => {
          URL.revokeObjectURL(audio.src);
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audio.src);
          reject(new Error('오디오 재생 중 오류가 발생했습니다.'));
        };

        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const counselingAPI = new CounselingAPI();