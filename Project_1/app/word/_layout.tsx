import { Stack } from 'expo-router';

export default function WordLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="[wordId]"
                options={{
                    headerShown: false, 
                }}
            />
        </Stack>
    );
}