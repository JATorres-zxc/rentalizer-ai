import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, User } from '@/services/api';
import { Profile, createProfileFromUser } from '@/utils/authHelpers';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData?: { displayName?: string; firstName?: string; lastName?: string; bio?: string; avatarFile?: File }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider initializing...');
        
        // Check if user has a valid token
        const token = apiService.getAuthToken();
        if (token) {
          // Try to fetch user profile to validate token
          try {
            const response = await apiService.getProfile();
            setUser(response.user);
            setProfile(createProfileFromUser(response.user));
            console.log('✅ User authenticated from token');
          } catch (error) {
            // Token is invalid, remove it
            console.log('❌ Invalid token, removing from storage');
            apiService.removeAuthToken();
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        apiService.removeAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting sign in for:', email);
    
    try {
      const response = await apiService.login({ email, password });
      
      // Store token and user data
      apiService.setAuthToken(response.token);
      setUser(response.user);
      setProfile(createProfileFromUser(response.user));
      
      console.log('✅ Sign in successful for:', email);
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, profileData?: { displayName?: string; firstName?: string; lastName?: string; bio?: string; avatarFile?: File }) => {
    console.log('📝 Starting sign up for:', email);
    
    try {
      const response = await apiService.register({
        email,
        password,
        firstName: profileData?.firstName,
        lastName: profileData?.lastName
      });
      
      // Store token and user data
      apiService.setAuthToken(response.token);
      setUser(response.user);
      setProfile(createProfileFromUser(response.user));
      
      console.log('✅ Sign up successful for:', email);
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    try {
      const response = await apiService.updateProfile({
        firstName: updates.display_name?.split(' ')[0],
        lastName: updates.display_name?.split(' ').slice(1).join(' ')
      });
      
      setUser(response.user);
      setProfile(createProfileFromUser(response.user));
      
      return { error: null };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return { error };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiService.changePassword({ currentPassword, newPassword });
      console.log('✅ Password changed successfully');
    } catch (error) {
      console.error('❌ Password change error:', error);
      throw error;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      await apiService.deleteAccount(password);
      
      // Clear local state and storage
      setUser(null);
      setProfile(null);
      apiService.removeAuthToken();
      
      console.log('✅ Account deleted successfully');
    } catch (error) {
      console.error('❌ Account deletion error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Starting signOut process');
    
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('⚠️ Logout request failed:', error);
    }
    
    // Clear local state and storage
    setUser(null);
    setProfile(null);
    apiService.removeAuthToken();
    
    // Redirect to login page
    window.location.href = '/auth/login';
    
    console.log('✅ SignOut completed successfully');
  };

  const value = {
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    deleteAccount
  };

  console.log('🖥️ AuthProvider render - isLoading:', isLoading, 'user exists:', !!user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-cyan-300 text-xl">Loading...</div>
          <div className="text-gray-400 text-sm">Connecting to authentication...</div>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          </div>
          <div className="text-xs text-gray-500 mt-4">
            If this takes too long, please refresh the page
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
