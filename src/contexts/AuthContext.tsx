import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'facebook';
  credits: number;
  dailyCredits: number;
  rolloverCap: number;
  plan: string;
  hasCompletedOnboarding: boolean;
  facebookConnected: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
  claimBonusCredits: () => void;
  updateCredits: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveUser = (userData: User) => {
    setUser(userData);
  };

  const login = async (provider: 'google' | 'facebook') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: provider === 'google' ? 'Alex Johnson' : 'Alex Johnson',
      email: provider === 'google' ? 'alex@gmail.com' : 'alex@facebook.com',
      avatar: undefined,
      provider,
      credits: 50,
      dailyCredits: 5,
      rolloverCap: 30,
      plan: 'Free Forever',
      hasCompletedOnboarding: false,
      facebookConnected: provider === 'facebook',
    };
    
    saveUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const completeOnboarding = () => {
    if (user) {
      const updated = { ...user, hasCompletedOnboarding: true };
      saveUser(updated);
    }
  };

  const claimBonusCredits = () => {
    if (user) {
      const updated = { ...user, credits: user.credits + 500 };
      saveUser(updated);
    }
  };

  const updateCredits = (amount: number) => {
    if (user) {
      const updated = { ...user, credits: Math.max(0, user.credits + amount) };
      saveUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        completeOnboarding,
        claimBonusCredits,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
