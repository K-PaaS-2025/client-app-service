import { jwtDecode } from 'jwt-decode';
import { JwtData } from '@/types';

// JWT 기반 클라이언트 사이드 인증 관리
export const auth = {
  // 로그인 상태 확인
  isLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;

    // 쿠키에서 토큰 확인 (서버사이드와 동일한 방식)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];

    if (!token) return false;

    try {
      const decoded: JwtData = jwtDecode(token);
      return Date.now() < decoded.exp * 1000;
    } catch {
      return false;
    }
  },

  // 사용자 정보 가져오기
  getUser: () => {
    if (typeof window === 'undefined') return null;

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];

    if (!token) return null;

    try {
      const decoded: JwtData = jwtDecode(token);
      if (Date.now() >= decoded.exp * 1000) return null;

      return {
        email: decoded.email || decoded.sub,
        loginTime: new Date(decoded.iat * 1000).toISOString()
      };
    } catch {
      return null;
    }
  },

  // 로그아웃 처리
  logout: () => {
    if (typeof window !== 'undefined') {
      // 쿠키 삭제
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // 페이지 새로고침으로 미들웨어가 리다이렉트하도록 함
      window.location.href = '/login';
    }
  }
};