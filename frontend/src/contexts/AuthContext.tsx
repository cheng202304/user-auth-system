import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User, LoginRequest, RegisterRequest } from '../services/api';

/**
 * Authentication context interface
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize authentication state
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication from stored tokens
   */
  const initializeAuth = async (): Promise<void> => {
    try {
      if (apiClient.isAuthenticated()) {
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      // Invalid or expired tokens, clear them
      console.error('Failed to initialize auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setError(null);
      const response = await apiClient.login(credentials);
      setUser(response.user);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    }
  };

  /**
   * Register function
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setError(null);
      const newUser = await apiClient.register(userData);
      setUser(newUser);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    }
  };

  /**
   * Logout function
   */
  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  /**
   * Clear error message
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
