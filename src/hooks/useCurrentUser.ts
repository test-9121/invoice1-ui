import { useState, useEffect } from 'react';
import type { User } from '@/types/user';

// Helper to decode JWT (without validation)
function parseJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function useCurrentUser(): { user: Partial<User> | null, loading: boolean } {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    const payload = parseJwt(accessToken);
    if (!payload) {
      setUser(null);
      setLoading(false);
      return;
    }
    // Map JWT payload to user fields (customize as needed)
    setUser({
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      roles: payload.roles || [],
    });
    setLoading(false);
  }, []);

  return { user, loading };
}
