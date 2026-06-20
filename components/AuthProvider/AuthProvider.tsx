'use client';

import { useEffect, type ReactNode } from 'react';
import { checkSession, getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore(state => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    state => state.clearIsAuthenticated
  );

  useEffect(() => {
    const verifySession = async (): Promise<void> => {
      const isValidSession = await checkSession();

      if (!isValidSession) {
        clearIsAuthenticated();
        return;
      }

      try {
        const user = await getMe();
        setUser(user);
      } catch {
        clearIsAuthenticated();
      }
    };

    void verifySession();
  }, [setUser, clearIsAuthenticated]);

  return children;
}

export default AuthProvider;