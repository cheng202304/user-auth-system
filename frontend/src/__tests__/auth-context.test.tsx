import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

// Mock the API client
jest.mock('../services/api', () => ({
  apiClient: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have initial state with no user and not authenticated', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load user from token on initialization', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.getCurrentUser.mockResolvedValue({
        id: 1,
        account: '123456',
        username: 'Test User',
        email: 'test@example.com',
        role: 'student',
        status: 1,
        created_at: '2024-01-01',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle initialization error gracefully', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.getCurrentUser.mockRejectedValue(new Error('Token expired'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully and set user', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 1,
          account: '123456',
          username: 'Test User',
          email: 'test@example.com',
          role: 'student',
          status: 1,
          created_at: '2024-01-01',
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' });
      });

      expect(mockApiClient.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.error).toBeNull();
    });

    it('should handle login error', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrongpassword' });
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should set error on login failure', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrongpassword' });
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully and set user', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.register.mockResolvedValue({
        id: 1,
        account: '123456',
        username: 'New User',
        email: 'new@example.com',
        role: 'student',
        status: 1,
        created_at: '2024-01-01',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          username: 'New User',
        });
      });

      expect(mockApiClient.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        username: 'New User',
      });
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('new@example.com');
    });

    it('should handle registration error', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.register.mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
          });
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear user', async () => {
      // First set a logged in user
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.getCurrentUser.mockResolvedValue({
        id: 1,
        account: '123456',
        username: 'Test User',
        email: 'test@example.com',
        role: 'student',
        status: 1,
        created_at: '2024-01-01',
      });
      mockApiClient.logout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform logout
      await act(async () => {
        await result.current.logout();
      });

      expect(mockApiClient.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear user even if logout API fails', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.getCurrentUser.mockResolvedValue({
        id: 1,
        account: '123456',
        username: 'Test User',
        email: 'test@example.com',
        role: 'student',
        status: 1,
        created_at: '2024-01-01',
      });
      mockApiClient.logout.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      // User should be cleared even if logout fails
      expect(result.current.user).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Trigger login error
      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrong' });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('refreshUser', () => {
    it('should refresh user data', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.getCurrentUser.mockResolvedValue({
        id: 1,
        account: '123456',
        username: 'Updated User',
        email: 'updated@example.com',
        role: 'student',
        status: 1,
        created_at: '2024-01-01',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.email).toBe('updated@example.com');
    });

    it('should handle refresh error', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.getCurrentUser.mockRejectedValue(new Error('Failed to fetch'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toBeNull();
    });
  });
});
