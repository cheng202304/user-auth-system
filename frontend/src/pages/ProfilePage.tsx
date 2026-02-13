import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ProfileUpdateData, PasswordChangeData } from '../types';
import { profileApi, setAuthToken, removeAuthToken } from '../services/api';

interface ProfileContextType {
  profile: User | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
  changePassword: (data: PasswordChangeData) => Promise<boolean>;
  clearError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileApi.updateProfile(data);
      if (response.success && response.data) {
        setProfile(response.data);
        return true;
      } else {
        setError(response.error || 'Failed to update profile');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: PasswordChangeData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileApi.changePassword(data);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to change password');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        changePassword,
        clearError,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
