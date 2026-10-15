import { jwtDecode } from 'jwt-decode';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  secureStorageService,
  type SessionData,
} from '@/core/storage/secureStorageService';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  signInWithToken: (token: string, sessionData?: SessionData) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isTokenUnexpired(token: string): boolean {
  try {
    const payload = jwtDecode<{ exp?: number }>(token);
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const token = await secureStorageService.getToken();

        if (token !== null && isTokenUnexpired(token)) {
          if (isMounted) setStatus('authenticated');
          return;
        }

        await secureStorageService.deleteToken();
        await secureStorageService.deleteSessionData();
        if (isMounted) setStatus('unauthenticated');
      } catch {
        if (isMounted) setStatus('unauthenticated');
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithToken = async (
    token: string,
    sessionData?: SessionData,
  ) => {
    if (!isTokenUnexpired(token)) {
      throw new Error('The authentication service returned an invalid or expired JWT.');
    }

    setStatus('loading');
    try {
      if (sessionData !== undefined) {
        await secureStorageService.saveSessionData(sessionData);
      }
      await secureStorageService.saveToken(token);
      if (
        process.env.NODE_ENV !== 'production' &&
        !(await secureStorageService.verifyTokenReadForDevelopment())
      ) {
        throw new Error('SecureStore did not return the saved JWT.');
      }
      setStatus('authenticated');
    } catch (error) {
      setStatus('unauthenticated');
      throw error;
    }
  };

  const signOut = async () => {
    setStatus('loading');
    try {
      await secureStorageService.deleteToken();
      await secureStorageService.deleteSessionData();
      setStatus('unauthenticated');
    } catch (error) {
      setStatus('authenticated');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ status, signInWithToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}