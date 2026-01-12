// Authentication Service

import { apiClient } from '@/lib/api-client';
import type {
  AuthResponse,
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types/auth';

const AUTH_BASE_PATH = '/api/v1/auth';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${AUTH_BASE_PATH}/register`, data);
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${AUTH_BASE_PATH}/login`, data);
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${AUTH_BASE_PATH}/refresh`, data);
  }

  /**
   * Logout from current device
   */
  async logout(data: LogoutRequest): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE_PATH}/logout`,
      data,
      true
    );
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE_PATH}/logout-all`,
      {},
      true
    );
  }

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE_PATH}/forgot-password`,
      data
    );
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE_PATH}/reset-password`,
      data
    );
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>(
      `${AUTH_BASE_PATH}/change-password`,
      data,
      true
    );
  }

  /**
   * Store tokens in localStorage
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Clear tokens from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
