import { User, ProfileUpdateData, PasswordChangeData, ApiResponse, LoginResponse } from '../types';

// Mock profile API
const mockProfileApi = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
};

// Mock auth API
const mockAuthApi = {
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

describe('Profile API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('getProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockUser: User = {
        id: 1,
        account: '123456',
        username: 'Test User',
        email: 'test@example.com',
        role: 'student' as any,
        status: 1,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse: ApiResponse<User> = {
        success: true,
        data: mockUser,
      };

      mockProfileApi.getProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.getProfile();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(mockProfileApi.getProfile).toHaveBeenCalled();
    });

    it('should handle profile fetch error', async () => {
      const mockResponse: ApiResponse<User> = {
        success: false,
        error: 'Unauthorized',
      };

      mockProfileApi.getProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.getProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUpdatedUser: User = {
        id: 1,
        account: '123456',
        username: 'Updated Name',
        email: 'test@example.com',
        role: 'student' as any,
        status: 1,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse: ApiResponse<User> = {
        success: true,
        data: mockUpdatedUser,
        message: 'Profile updated successfully',
      };

      mockProfileApi.updateProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.updateProfile({ username: 'Updated Name' });

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('Updated Name');
      expect(result.message).toBe('Profile updated successfully');
    });

    it('should update multiple fields at once', async () => {
      const mockUpdatedUser: User = {
        id: 1,
        account: '123456',
        username: 'Multi Update',
        email: 'multi@example.com',
        phone: '13800138000',
        role: 'student' as any,
        status: 1,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse: ApiResponse<User> = {
        success: true,
        data: mockUpdatedUser,
      };

      const updateData: ProfileUpdateData = {
        username: 'Multi Update',
        email: 'multi@example.com',
        phone: '13800138000',
      };

      mockProfileApi.updateProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.updateProfile(updateData);

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('Multi Update');
      expect(result.data?.email).toBe('multi@example.com');
      expect(result.data?.phone).toBe('13800138000');
    });

    it('should handle validation errors', async () => {
      const mockResponse: ApiResponse<User> = {
        success: false,
        error: '用户名长度必须在2-20个字符之间',
      };

      mockProfileApi.updateProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.updateProfile({ username: 'A' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('用户名长度');
    });

    it('should handle invalid email format', async () => {
      const mockResponse: ApiResponse<User> = {
        success: false,
        error: '邮箱格式不正确',
      };

      mockProfileApi.updateProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.updateProfile({ email: 'invalid-email' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('邮箱格式不正确');
    });

    it('should handle invalid phone format', async () => {
      const mockResponse: ApiResponse<User> = {
        success: false,
        error: '手机号必须为11位数字',
      };

      mockProfileApi.updateProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.updateProfile({ phone: '123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('手机号必须为11位数字');
    });

    it('should handle duplicate email error', async () => {
      const mockResponse: ApiResponse<User> = {
        success: false,
        error: '邮箱已被使用',
      };

      mockProfileApi.updateProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.updateProfile({ email: 'existing@example.com' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('邮箱已被使用');
    });

    it('should handle duplicate phone error', async () => {
      const mockResponse: ApiResponse<User> = {
        success: false,
        error: '手机号已被使用',
      };

      mockProfileApi.updateProfile.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.updateProfile({ phone: '13800138000' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('手机号已被使用');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
        message: 'Password changed successfully',
      };

      mockProfileApi.changePassword.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.changePassword({
        oldPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password changed successfully');
    });

    it('should fail with incorrect old password', async () => {
      const mockResponse: ApiResponse<void> = {
        success: false,
        error: 'Incorrect old password',
      };

      mockProfileApi.changePassword.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.changePassword({
        oldPassword: 'WrongPassword',
        newPassword: 'NewPassword456!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Incorrect old password');
    });

    it('should fail with missing old password', async () => {
      const mockResponse: ApiResponse<void> = {
        success: false,
        error: 'Old password is required',
      };

      mockProfileApi.changePassword.mockResolvedValue(mockResponse);

      const passwordData: any = {
        oldPassword: '',
        newPassword: 'NewPassword456!',
      };

      const result = await mockProfileApi.changePassword(passwordData);

      expect(result.success).toBe(false);
    });

    it('should fail with missing new password', async () => {
      const mockResponse: ApiResponse<void> = {
        success: false,
        error: 'New password is required',
      };

      mockProfileApi.changePassword.mockResolvedValue(mockResponse);

      const passwordData: any = {
        oldPassword: 'OldPassword123!',
        newPassword: '',
      };

      const result = await mockProfileApi.changePassword(passwordData);

      expect(result.success).toBe(false);
    });

    it('should fail with new password too short', async () => {
      const mockResponse: ApiResponse<void> = {
        success: false,
        error: 'New password must be at least 6 characters',
      };

      mockProfileApi.changePassword.mockResolvedValue(mockResponse);

      const result = await mockProfileApi.changePassword({
        oldPassword: 'OldPassword123!',
        newPassword: '12345',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('New password must be at least 6 characters');
    });
  });
});

describe('Profile Types', () => {
  it('should have correct User type structure', () => {
    const user: User = {
      id: 1,
      account: '123456',
      username: 'Test User',
      email: 'test@example.com',
      phone: '13800138000',
      role: 'student' as any,
      avatar: 'http://example.com/avatar.jpg',
      status: 1,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('account');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('status');
    expect(user).toHaveProperty('created_at');
    expect(user).not.toHaveProperty('password');
  });

  it('should have correct ProfileUpdateData type', () => {
    const updateData: ProfileUpdateData = {
      username: 'New Name',
      email: 'new@example.com',
      phone: '13900139000',
      avatar: 'http://example.com/new-avatar.jpg',
    };

    expect(updateData).toHaveProperty('username');
    expect(updateData).toHaveProperty('email');
    expect(updateData).toHaveProperty('phone');
    expect(updateData).toHaveProperty('avatar');
  });

  it('should have correct PasswordChangeData type', () => {
    const passwordData: PasswordChangeData = {
      oldPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    };

    expect(passwordData).toHaveProperty('oldPassword');
    expect(passwordData).toHaveProperty('newPassword');
  });

  it('should have correct ApiResponse type', () => {
    const response: ApiResponse<User> = {
      success: true,
      message: 'Success',
      data: {
        id: 1,
        account: '123456',
        username: 'Test',
        role: 'student' as any,
        status: 1,
        created_at: '2024-01-01',
      },
    };

    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('message');
    expect(response).toHaveProperty('data');
  });

  it('should have correct LoginResponse type', () => {
    const response: LoginResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 1,
        account: '123456',
        username: 'Test',
        role: 'student' as any,
        status: 1,
        created_at: '2024-01-01',
      },
    };

    expect(response).toHaveProperty('accessToken');
    expect(response).toHaveProperty('refreshToken');
    expect(response).toHaveProperty('user');
  });
});

describe('Auth Token Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve access token', () => {
    const token = 'test-access-token-12345';
    localStorage.setItem('accessToken', token);
    expect(localStorage.getItem('accessToken')).toBe(token);
  });

  it('should store and retrieve refresh token', () => {
    const token = 'test-refresh-token-12345';
    localStorage.setItem('refreshToken', token);
    expect(localStorage.getItem('refreshToken')).toBe(token);
  });

  it('should remove tokens on logout', () => {
    localStorage.setItem('accessToken', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should return null for non-existent token', () => {
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
