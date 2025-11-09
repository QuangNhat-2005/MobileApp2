import { Stack } from 'expo-router';
import { SoundProvider } from '../context/SoundContext'; 

export default function RootLayout() {
  return (
   
    <SoundProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="word" options={{ headerShown: false }} />
        <Stack.Screen name="reviewSession" options={{ headerShown: false }} />
        <Stack.Screen name="accountSecurity" options={{ headerShown: false }} />
        <Stack.Screen name="changePassword" options={{ headerShown: false }} />
        <Stack.Screen name="editProfile" options={{ headerShown: false }} />

        <Stack.Screen
          name="lessonSession"
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack>
    </SoundProvider>
  );
}