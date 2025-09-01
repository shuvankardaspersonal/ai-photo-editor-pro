
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
  picture?: string | null;
  credits: number;
  created_at: string;
  googleid: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: import('@supabase/supabase-js').Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: number; // in INR
  features: string[];
}
