import { Stack } from 'expo-router';
import { useAuth } from '@/components/auth-context';

export default function AppLayout() {
  const { token } = useAuth();
  return (
    <Stack>
      <Stack.Protected guard={token === null}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
      </Stack.Protected>

      <Stack.Protected guard={token !== null}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
      </Stack.Protected>
      {/* Expo Router includes all routes by default. Adding Stack.Protected creates exceptions for these screens. */}
    </Stack>
  );
}
