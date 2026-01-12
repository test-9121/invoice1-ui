// Authentication Context

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = authService.getAccessToken();
        const refreshToken = authService.getRefreshToken();

        if (accessToken && refreshToken) {
          // Try to refresh token to validate session
          await refreshAuth();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        authService.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
        setUser(response.data.user);
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.data.user.firstName}!`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setIsLoading(true);
      const response = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      if (response.success && response.data) {
        authService.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
        setUser(response.data.user);
        
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created successfully!',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearTokens();
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken({ refreshToken });

      if (response.success && response.data) {
        authService.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      authService.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
