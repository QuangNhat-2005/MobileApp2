import { Stack } from 'expo-router';

export default function ArenaLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
                name="sprint"
                options={{ presentation: 'modal' }}
            />

        </Stack>
    );
}