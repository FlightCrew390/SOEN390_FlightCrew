export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  studentId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
  clientId: string; // The OAuth client ID used to obtain these tokens
}
