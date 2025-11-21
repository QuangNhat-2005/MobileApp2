import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SoundProvider } from '../context/SoundContext';

// --- QUAN TRỌNG: Đặt đoạn này RA NGOÀI hàm component ---
// Để nó chạy ngay lập tức trước khi giao diện được vẽ
if (Platform.OS === 'web') {
  const originalError = console.error;
  console.error = (...args) => {
    // Kiểm tra chuỗi lỗi. Nếu chứa từ khóa liên quan đến lỗi này thì chặn lại.
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('collapsable') || args[0].includes('non-boolean'))
    ) {
      return;
    }
    originalError(...args);
  };
}
// -------------------------------------------------------

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