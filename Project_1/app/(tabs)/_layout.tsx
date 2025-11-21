import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import cái này
import { useSound } from '../../hooks/useSound';

export default function TabLayout() {
  const router = useRouter();
  const playSound = useSound();

  // 2. Lấy thông số vùng an toàn của thiết bị hiện tại
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          playSound('click2');
        },
      }}
      screenOptions={{
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarShowLabel: true,

        tabBarStyle: {
          position: 'absolute',
          // 3. LOGIC TỰ ĐỘNG ĐIỀU CHỈNH VỊ TRÍ:
          // - Web: Cách đáy 25px (như cũ).
          // - Mobile: Cách đáy 15px + Chiều cao của thanh điều hướng hệ thống (insets.bottom).
          // -> Đảm bảo luôn nằm trên thanh gạch ngang của điện thoại.
          bottom: Platform.OS === 'web' ? 25 : (15 + insets.bottom),

          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 70,
          borderTopWidth: 0,

          // Canh chỉnh nội dung bên trong thanh Tab cho cân đối
          paddingBottom: Platform.OS === 'ios' ? 0 : 10, // iOS tự căn rồi, Android cần đẩy lên xíu
          paddingTop: 10,

          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="home" color={color} />
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="school" color={color} />
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(tabs)/learn');
          },
        }}
      />

      <Tabs.Screen
        name="arena"
        options={{
          title: 'Arena',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={26} name="sword-cross" color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="person" color={color} />
        }}
      />
    </Tabs>
  );
}