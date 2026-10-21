import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, type UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: 'patient' | 'doctor';
  loading: boolean;
  isConfigured: boolean;
  authError: string | null;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signInDemo: (role?: 'patient' | 'doctor') => void;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  // Load user profile from Supabase database
  const loadProfile = useCallback(async (userId: string, userEmail?: string, userMetadata?: Record<string, any>) => {
    if (!isConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not fetch profile from Supabase:', error.message);
      }

      if (data) {
        const userProf: UserProfile = {
          id: data.id,
          email: data.email || userEmail || '',
          full_name: data.full_name || userMetadata?.full_name || 'Patient',
          role: data.role === 'doctor' ? 'doctor' : 'patient',
          phone: data.phone,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setProfile(userProf);
        return userProf;
      }

      // If no profile row exists yet, create or fallback to metadata
      // Default role is strictly 'patient' per security rules
      const fallbackRole: 'patient' | 'doctor' = userMetadata?.role === 'doctor' ? 'doctor' : 'patient';
      const newProfile: UserProfile = {
        id: userId,
        email: userEmail || '',
        full_name: userMetadata?.full_name || 'DocTalk User',
        role: fallbackRole
      };

      // Try inserting into profiles table if RLS allows
      try {
        await supabase.from('profiles').upsert([
          {
            id: userId,
            email: userEmail || '',
            full_name: newProfile.full_name,
            role: fallbackRole
          }
        ], { onConflict: 'id' });
      } catch (e) {
        console.warn('Profile table upsert skipped:', e);
      }

      setProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error('Error loading profile:', err);
      return null;
    }
  }, [isConfigured]);

  // Initial session restoration on page load/refresh
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isConfigured) {
        const storedDemo = localStorage.getItem('doctalk_demo_auth');
        if (storedDemo) {
          try {
            const { role: demoRole } = JSON.parse(storedDemo);
            const demoUser = {
              id: demoRole === 'doctor' ? 'doctor-demo-uuid' : 'patient-demo-uuid',
              email: demoRole === 'doctor' ? 'dr.anita@doctalk.health' : 'ramesh.kumar@doctalk.health',
              user_metadata: {
                full_name: demoRole === 'doctor' ? 'Dr. Anita Rao' : 'Ramesh Kumar',
                role: demoRole
              }
            } as unknown as User;
            setUser(demoUser);
            setProfile({
              id: demoUser.id,
              email: demoUser.email!,
              full_name: demoRole === 'doctor' ? 'Dr. Anita Rao' : 'Ramesh Kumar',
              role: demoRole
            });
          } catch (e) {
            console.warn(e);
          }
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error restoring session:', error.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await loadProfile(
              initialSession.user.id,
              initialSession.user.email,
              initialSession.user.user_metadata
            );
          }
        }
      } catch (err) {
        console.error('Failed to restore Supabase session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen to Supabase auth events
    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, currentSession) => {
          if (!mounted) return;

          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            await loadProfile(
              currentSession.user.id,
              currentSession.user.email,
              currentSession.user.user_metadata
            );
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      return () => {
        mounted = false;
      };
    }
  }, [isConfigured, loadProfile]);

  // Sign In with Email and Password
  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);

    if (!isConfigured) {
      const err = 'Supabase Project URL is not configured. Please add VITE_SUPABASE_URL to your .env file.';
      setAuthError(err);
      return { success: false, error: err };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await loadProfile(data.user.id, data.user.email, data.user.user_metadata);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during sign in.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Up with Email and Password
  // Strict rule: Public signups ALWAYS receive the 'patient' role.
  // Doctor roles are assigned strictly through administrative DB processes.
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setAuthError(null);

    if (!isConfigured) {
      const err = 'Supabase Project URL is not configured. Please add VITE_SUPABASE_URL to your .env file.';
      setAuthError(err);
      return { success: false, error: err };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'patient' // Strict patient assignment
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // If session was returned immediately (email confirmation disabled)
        if (data.session) {
          setUser(data.user);
          setSession(data.session);
          await loadProfile(data.user.id, data.user.email, { full_name: fullName, role: 'patient' });
          return { success: true, requiresEmailConfirmation: false };
        } else {
          // Email confirmation is required by Supabase project settings
          return { success: true, requiresEmailConfirmation: true };
        }
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during sign up.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Out
  const signOut = async () => {
    setAuthError(null);
    localStorage.removeItem('doctalk_demo_auth');
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const signInDemo = (demoRole: 'patient' | 'doctor' = 'patient') => {
    const demoUser = {
      id: demoRole === 'doctor' ? 'doctor-demo-uuid' : 'patient-demo-uuid',
      email: demoRole === 'doctor' ? 'dr.anita@doctalk.health' : 'ramesh.kumar@doctalk.health',
      user_metadata: {
        full_name: demoRole === 'doctor' ? 'Dr. Anita Rao' : 'Ramesh Kumar',
        role: demoRole
      }
    } as unknown as User;

    setUser(demoUser);
    setProfile({
      id: demoUser.id,
      email: demoUser.email!,
      full_name: demoRole === 'doctor' ? 'Dr. Anita Rao' : 'Ramesh Kumar',
      role: demoRole
    });
    localStorage.setItem('doctalk_demo_auth', JSON.stringify({ role: demoRole }));
  };

  const clearAuthError = () => setAuthError(null);

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id, user.email, user.user_metadata);
    }
  };

  const role: 'patient' | 'doctor' = profile?.role === 'doctor' ? 'doctor' : 'patient';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        isConfigured,
        authError,
        signInWithEmail,
        signUpWithEmail,
        signInDemo,
        signOut,
        clearAuthError,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
