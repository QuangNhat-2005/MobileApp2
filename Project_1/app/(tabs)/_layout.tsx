import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useSound } from '../../hooks/useSound';

export default function TabLayout() {
  const router = useRouter();
  const playSound = useSound();
  const handleTabPressWithSound = (defaultPressAction: () => void) => {
    defaultPressAction();
    playSound('click2');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A78BFA',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {

              handleTabPressWithSound(() => props.onPress(e));
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="school" color={color} />
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleTabPressWithSound(() => router.push('/learn'));
          },
        }}
      />

      <Tabs.Screen
        name="arena"
        options={{
          title: 'Arena',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="sword-cross" color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />
        }}
      />
    </Tabs>
  );
}