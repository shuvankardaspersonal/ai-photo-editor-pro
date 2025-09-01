
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import type { AuthContextType, UserProfile } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authUser: User) => {
    const googleId = authUser.user_metadata?.provider_id;
    if (!googleId) return null;

    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('googleid', googleId)
      .single();

    if (!profile) {
      // User does not exist, create a new profile
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          googleid: googleId,
          email: authUser.email,
          name: authUser.user_metadata?.full_name,
          picture: authUser.user_metadata?.avatar_url,
          credits: 5, // Free credits on sign up
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return null;
      }
      profile = newUser;
    }

    return profile as UserProfile;
  }, []);
  
  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if(session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(profile);
    }
  }, [fetchUserProfile]);


  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    session,
    user,
    loading,
    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.file',
        },
      });
      if (error) console.error('Error logging in:', error.message);
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error logging out:', error.message);
      setUser(null);
      setSession(null);
    },
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
