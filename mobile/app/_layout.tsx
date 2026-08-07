import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { palette } from '@/constants/kokoro-theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: palette.canvas } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="session" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
