import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
    <CurrencyProvider>
    <Stack>
      <Stack.Screen name="index"   options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="modal"   options={{ headerShown: false }} />
      <Stack.Screen name="app"     options={{ headerShown: false }} />
    </Stack>
    </CurrencyProvider>
    </ThemeProvider>
  );
}
