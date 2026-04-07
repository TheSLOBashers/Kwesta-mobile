// hooks/useAuthRedirect.ts
import { useEffect, useState } from 'react';
import { RelativePathString, useRouter } from 'expo-router';

export default function useNoAuthRedirect(redirectTo : RelativePathString, token: string | null) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        router.replace(redirectTo);
      } else {
        console.log(token)
        setLoading(false);
      }
    };
    checkAuth();
  }, [token]);

  return loading;
}