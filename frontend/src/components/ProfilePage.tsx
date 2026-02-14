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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    clearError();
    setSuccessMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    clearError();
    setSuccessMessage(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

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
      setSuccessMessage('Profile updated successfully');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    const passwordData: PasswordChangeData = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    };

    const success = await changePassword(passwordData);
    if (success) {
      setSuccessMessage('Password changed successfully');
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  if (loading && !profile) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <h1>Profile Settings</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button
          className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Avatar URL</label>
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={profileForm.avatar}
              onChange={handleProfileChange}
              placeholder="Enter avatar URL"
            />
          </div>

          <div className="form-group">
            <label>Account</label>
            <input type="text" value={profile?.account || ''} disabled />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input type="text" value={profile?.role || ''} disabled />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}
