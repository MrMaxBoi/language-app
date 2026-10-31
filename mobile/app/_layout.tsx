import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';

import { KANA_FONT_ASSETS, palette } from '@/constants/kokoro-theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // The kana font is 76KB and local, so this wait is a frame or two. If it fails, the app still
  // opens and kana fall back to the system font.
  const [fontsLoaded, fontError] = useFonts(KANA_FONT_ASSETS);
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: palette.canvas } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[lessonId]" options={{ headerShown: false }} />
        {/* Fade, so the kana row appears to stay put while the teaching card becomes a question card. */}
        <Stack.Screen name="session" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="result" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
