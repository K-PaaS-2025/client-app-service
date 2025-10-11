'use server';

// Types
import { JwtData, serverActionMessage } from "@/types";
import { jwtDecode } from "jwt-decode";

// Credentials
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";

export async function login(_: serverActionMessage | null, formData: FormData): Promise<serverActionMessage> {
    const email = formData.get('email');
    const password = formData.get('password');

    const credentials = btoa(`${email}:${password}`);

    const response = await fetch(`${process.env.API_SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
        },
        credentials: 'include',
    });

    if (!response.ok) {
        return {
            status: 500,
            message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        }
    }

    // 'use server'; 때문에 쿠키가 client로 저장되지 않음
    const cookieList = response.headers.getSetCookie().map((v) => v.slice(0, v.indexOf(' ') - 1).split('='));

    const cookieStore = await cookies();
    for (const cookieInfo of cookieList) {
        const decoded: JwtData = jwtDecode(cookieInfo[1]);
        cookieStore.set({
            name: cookieInfo[0],
            value: decodeURIComponent(cookieInfo[1]),
            expires: new Date((decoded.exp + 9 * 60 * 60) * 1000) // 한국: GMT +9 = 9*60*60
        });
    }

    redirect('/home');
}

export async function signup(_: serverActionMessage | null, formData: FormData): Promise<serverActionMessage> {
    const email = formData.get('email');
    const password = formData.get('password');

    const response = await fetch(`${process.env.API_SERVER_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        return {
            status: 500,
            message: '회원가입 중 오류가 발생했습니다.'
        }
    }

    // Auto login after signup
    const credentials = btoa(`${email}:${password}`);

    const loginResponse = await fetch(`${process.env.API_SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
        },
        credentials: 'include',
    });

    if (!loginResponse.ok) {
        return {
            status: 500,
            message: '회원가입은 완료되었지만 로그인 중 오류가 발생했습니다.'
        }
    }

    const cookieList = loginResponse.headers.getSetCookie().map((v) => v.slice(0, v.indexOf(' ') - 1).split('='));

    const cookieStore = await cookies();
    for (const cookieInfo of cookieList) {
        const decoded: JwtData = jwtDecode(cookieInfo[1]);
        cookieStore.set({
            name: cookieInfo[0],
            value: decodeURIComponent(cookieInfo[1]),
            expires: new Date((decoded.exp + 9 * 60 * 60) * 1000)
        });
    }

    redirect('/home');
}