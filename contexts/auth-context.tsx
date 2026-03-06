'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { type User as SupabaseUser, type AuthChangeEvent, type Session } from '@supabase/supabase-js';

export type UserRole = 'candidate' | 'recruiter';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoggingOut = useRef(false);

  // Map Supabase User to our User interface
  const mapUser = useCallback(async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
    if (!supabaseUser) return null;

    // Fetch profile from our custom profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', supabaseUser.id)
      .single();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
      role: (profile?.role as UserRole) || (supabaseUser.user_metadata?.role as UserRole) || 'candidate',
    };
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange with INITIAL_SESSION event instead of getSession()
    // to avoid the "Lock broken by steal" error from concurrent getSession() calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      // Skip auth state changes while logging out to prevent bounce-back
      if (isLoggingOut.current) return;

      if (session?.user) {
        const mappedUser = await mapUser(session.user);
        if (mounted) setUser(mappedUser);
      } else {
        if (mounted) setUser(null);
      }

      if (mounted) {
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mapUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        const mappedUser = await mapUser(data.user);
        setUser(mappedUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mapUser]);

  const signup = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        }
      });

      if (error) throw new Error(error.message);

      // Handle case where email confirmation is required
      if (data.user && !data.session) {
        throw new Error('Please check your email to confirm your account, then login.');
      }

      if (data.user) {
        const mappedUser = await mapUser(data.user);
        setUser(mappedUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mapUser]);

  const logout = useCallback(async () => {
    isLoggingOut.current = true;
    setUser(null);
    await supabase.auth.signOut();
    isLoggingOut.current = false;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isInitialized, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
