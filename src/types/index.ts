export interface JwtData {
  exp: number;
  iat: number;
  sub: string;
  email?: string;
}

export interface serverActionMessage {
  status: number;
  message: string;
}