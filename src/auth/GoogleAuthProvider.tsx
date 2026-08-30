import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type GoogleUser = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: 'admin' | 'member';
};

type AuthContextValue = {
  user: GoogleUser | null;
  loading: boolean;
  configured: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function requestSession(method: 'GET' | 'POST' | 'DELETE', credential?: string) {
  const response = await fetch('/api/auth/google', {
    method,
    credentials: 'include',
    headers: credential ? { 'Content-Type': 'application/json' } : undefined,
    body: credential ? JSON.stringify({ credential }) : undefined,
  });

  if (method === 'DELETE') return null;
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error || 'Google authentication failed');
  return payload.user as GoogleUser | null;
}

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [gisReady, setGisReady] = useState(false);
  const configured = Boolean(__GOOGLE_CLIENT_ID__);

  const handleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      const authenticatedUser = await requestSession('POST', response.credential);
      setUser(authenticatedUser);
    } catch (error) {
      console.error('Google authentication failed:', error);
      alert('Google 登入失敗，請稍後再試。');
    }
  }, []);

  useEffect(() => {
    requestSession('GET')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!configured) return;
    let attempts = 0;
    const maxAttempts = 100;
    const waitForGoogle = window.setInterval(() => {
      if (!window.google?.accounts.id) {
        attempts += 1;
        if (attempts >= maxAttempts) window.clearInterval(waitForGoogle);
        return;
      }
      window.clearInterval(waitForGoogle);
      window.google.accounts.id.initialize({
        client_id: __GOOGLE_CLIENT_ID__,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setGisReady(true);
    }, 50);

    return () => window.clearInterval(waitForGoogle);
  }, [configured, handleCredential]);

  const signIn = useCallback(() => {
    if (!configured) {
      alert('Google OAuth 尚未設定。');
      return;
    }
    if (!gisReady || !window.google?.accounts.id) {
      alert('Google 登入元件載入中，請稍後再試。');
      return;
    }
    window.google.accounts.id.prompt();
  }, [configured, gisReady]);

  const signOut = useCallback(async () => {
    await requestSession('DELETE');
    window.google?.accounts.id.disableAutoSelect();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    configured,
    signIn,
    signOut,
  }), [configured, loading, signIn, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useGoogleAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useGoogleAuth must be used inside GoogleAuthProvider');
  return context;
}
