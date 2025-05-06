import { createClient } from '@supabase/supabase-js';
import { getOAuthCallbackUrl } from './environment';

// Initialize the Supabase client
const supabaseUrl = 'https://supabase.nonprod.aws.mailopoly.com';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';



// Create a simple storage adapter for SSR compatibility
const createStorageAdapter = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return dummy storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  // Client-side - return localStorage adapter
  return {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
    removeItem: (key: string) => window.localStorage.removeItem(key),
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'oxinews-auth-token',
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: createStorageAdapter(),
  },
  // global: {
  //   headers: {
  //     'x-application-name': 'oxinews',
  //   },
  // },
});

// Helper function to check if session exists
export async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Exception checking session:', error);
    return null;
  }
}

// OAuth sign in helper
export async function signInWithOAuth(provider: 'google') {
  try {
    const redirectTo = getOAuthCallbackUrl();
    
    // Clean up any app-specific OAuth data
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('oxinews-oauth-timestamp');
      window.localStorage.removeItem('oxinews-oauth-provider');
    }
    
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
        scopes: 'email profile',
      },
    });
  } catch (error) {
    console.error('OAuth sign in error:', error);
    return { error };
  }
}
