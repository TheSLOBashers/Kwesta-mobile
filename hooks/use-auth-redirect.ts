// hooks/useAuthRedirect.ts
import { useEffect, useState } from 'react';
import { RelativePathString, useRouter } from 'expo-router';
import { useAuth } from '@/components/auth-context';

export default function useAuthRedirect(redirectTo : RelativePathString) {
  const {token} = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        router.replace(redirectTo);
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token]);

  return loading;
}