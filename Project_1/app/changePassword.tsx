import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router'; 
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import apiClient from '../api/axiosConfig';
import { useSound } from '../hooks/useSound';
const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

export default function ChangePasswordScreen() {
    const router = useRouter();
    const playSound = useSound();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async () => {
        playSound('click');
        if (!currentPassword || !newPassword || !confirmPassword) {
            return showAlert('Error', 'Please fill in all fields.');
        }
        if (newPassword !== confirmPassword) {
            return showAlert('Error', 'New passwords do not match.');
        }
        if (newPassword.length < 6) {
            return showAlert('Error', 'New password must be at least 6 characters long.');
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post('/api/auth/change-password', {
                currentPassword,
                newPassword,
            });
            showAlert('Success', response.data.msg || 'Password updated successfully!');
            router.back();
        } catch (error: any) {
            const message = error.response?.data?.msg || 'An error occurred. Please try again.';
            showAlert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Change Password</Text>
                    </View>
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleUpdatePassword} disabled={isLoading}>
                            <Text style={styles.buttonText}>{isLoading ? 'Updating...' : 'Update Password'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 30
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    form: {
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        color: '#1F2937'
    },
    button: {
        backgroundColor: '#8B5CF6',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
    },
    buttonDisabled: {
        backgroundColor: '#C4B5FD',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
});