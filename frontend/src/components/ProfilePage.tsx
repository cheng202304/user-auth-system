import React, { useState, useEffect } from 'react';
import { useProfile } from '../pages/ProfilePage';
import { ProfileUpdateData, PasswordChangeData } from '../types';

interface ProfileFormData {
  username: string;
  email: string;
  phone: string;
  avatar: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  phone?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function ProfilePage() {
  const { profile, loading, error, fetchProfile, updateProfile, changePassword, clearError } = useProfile();

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: '',
    email: '',
    phone: '',
    avatar: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  const validateProfileForm = (): boolean => {
    const errors: FormErrors = {};

    // 用户名验证
    if (!profileForm.username) {
      errors.username = '用户名不能为空';
    } else if (profileForm.username.length < 2 || profileForm.username.length > 20) {
      errors.username = '用户名长度必须在2-20个字符之间';
    }

    // 邮箱验证
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 手机号验证
    if (profileForm.phone && !/^1[3-9]\d{9}$/.test(profileForm.phone)) {
      errors.phone = '请输入有效的11位手机号码';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: FormErrors = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = '当前密码不能为空';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = '新密码不能为空';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = '新密码长度至少6位';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    clearError();
    setSuccessMessage(null);
    
    // 清除当前字段的错误
    setProfileErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    clearError();
    setSuccessMessage(null);
    
    // 清除当前字段的错误
    setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateProfileForm()) {
      return;
    }

    const updateData: ProfileUpdateData = {};

    if (profileForm.username !== profile?.username) {
      updateData.username = profileForm.username;
    }
    if (profileForm.email !== profile?.email) {
      updateData.email = profileForm.email;
    }
    if (profileForm.phone !== (profile?.phone || '')) {
      updateData.phone = profileForm.phone;
    }
    if (profileForm.avatar !== (profile?.avatar || '')) {
      updateData.avatar = profileForm.avatar;
    }

    if (Object.keys(updateData).length === 0) {
      return;
    }

    const success = await updateProfile(updateData);
    if (success) {
      setSuccessMessage('个人信息更新成功');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validatePasswordForm()) {
      return;
    }

    const passwordData: PasswordChangeData = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    };

    const success = await changePassword(passwordData);
    if (success) {
      setSuccessMessage('密码修改成功');
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="navbar">
        <a href="/" className="navbar-brand">
          用户认证系统
        </a>
        <div className="navbar-nav">
          <a href="/dashboard" className="btn-link">
            返回仪表盘
          </a>
        </div>
      </nav>

      <main className="container py-8">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            个人中心
          </h1>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          {/* 标签页导航 */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'profile' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              个人信息
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'password' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('password')}
            >
              修改密码
            </button>
          </div>

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    用户名
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    className={`form-input ${profileErrors.username ? 'error' : ''}`}
                    placeholder="请输入用户名"
                  />
                  {profileErrors.username && (
                    <p className="form-error">{profileErrors.username}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    邮箱
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className={`form-input ${profileErrors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                  />
                  {profileErrors.email && (
                    <p className="form-error">{profileErrors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    手机号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className={`form-input ${profileErrors.phone ? 'error' : ''}`}
                    placeholder="13800138000"
                  />
                  {profileErrors.phone && (
                    <p className="form-error">{profileErrors.phone}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="avatar" className="form-label">
                    头像URL
                  </label>
                  <input
                    type="url"
                    id="avatar"
                    name="avatar"
                    value={profileForm.avatar}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              {/* 只读信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                <div className="form-group">
                  <label className="form-label">账号</label>
                  <input 
                    type="text" 
                    value={profile?.account || ''} 
                    disabled 
                    className="form-input bg-gray-100"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">角色</label>
                  <input 
                    type="text" 
                    value={
                      profile?.role === 'super_admin' ? '超级管理员' :
                      profile?.role === 'admin' ? '管理员' :
                      profile?.role === 'teacher' ? '教师' : '学生'
                    } 
                    disabled 
                    className="form-input bg-gray-100"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary py-2 px-6"
                  disabled={loading}
                >
                  {loading ? '保存中...' : '保存更改'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="oldPassword" className="form-label">
                  当前密码
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.oldPassword ? 'error' : ''}`}
                  placeholder="请输入当前密码"
                />
                {passwordErrors.oldPassword && (
                  <p className="form-error">{passwordErrors.oldPassword}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  新密码
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                  placeholder="请输入新密码"
                />
                {passwordErrors.newPassword && (
                  <p className="form-error">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  确认新密码
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="请再次输入新密码"
                />
                {passwordErrors.confirmPassword && (
                  <p className="form-error">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary py-2 px-6"
                  disabled={loading}
                >
                  {loading ? '修改中...' : '修改密码'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
