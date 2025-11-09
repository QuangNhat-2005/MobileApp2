import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import apiClient from '../api/axiosConfig';
import { useSound } from '../hooks/useSound';

const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

export default function EditProfileScreen() {
    const router = useRouter();
    const playSound = useSound();

    const [username, setUsername] = useState('');
    const [initialUsername, setInitialUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                try {
                    const response = await apiClient.get('/api/auth/me');
                    setUsername(response.data.username);
                    setInitialUsername(response.data.username);
                    setAvatarUrl(response.data.avatarUrl);
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    showAlert('Error', 'Could not load your profile.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserData();
        }, [])
    );

    const handleSaveChanges = async () => {
        playSound('click');
        if (username.trim().length < 3) {
            return showAlert('Error', 'Username must be at least 3 characters long.');
        }
        if (username.trim() === initialUsername) {
            return router.back();
        }

        setIsSaving(true);
        try {
            const response = await apiClient.put('/api/auth/profile', {
                username: username.trim(),
            });
            showAlert('Success', response.data.msg || 'Profile updated successfully!');
            router.back();
        } catch (error: any) {
            const message = error.response?.data?.msg || 'An error occurred. Please try again.';
            showAlert('Error', message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePickAndUploadAvatar = async () => {
        playSound('click');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (result.canceled) {
            return;
        }

        const localUri = result.assets[0].uri;
        const formData = new FormData();

        if (Platform.OS === 'web') {
            const response = await fetch(localUri);
            const blob = await response.blob();
            formData.append('avatar', blob, 'avatar.jpg');
        } else {
            const filename = localUri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('avatar', { uri: localUri, name: filename, type } as any);
        }

        setIsSaving(true);
        try {
            const response = await apiClient.post('/api/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setAvatarUrl(response.data.avatarUrl);
            showAlert('Success', 'Avatar updated successfully!');
        } catch (error: any) {
            const message = error.response?.data?.msg || 'Failed to upload avatar.';
            showAlert('Error', message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#8B5CF6" /></View>;
    }

    const fullAvatarUrl = `${apiClient.defaults.baseURL}/uploads/${avatarUrl}`;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                    </View>

                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: fullAvatarUrl }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.avatarEditButton} onPress={handlePickAndUploadAvatar} disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="camera" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your username"
                            placeholderTextColor="#9CA3AF"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TouchableOpacity style={[styles.button, isSaving && styles.buttonDisabled]} onPress={handleSaveChanges} disabled={isSaving}>
                            <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0eaff' },
    container: { flex: 1 },
    scrollContent: { paddingTop: 60, paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    avatarEditButton: {
        position: 'absolute',
        bottom: 0,
        right: '30%',
        backgroundColor: '#8B5CF6',
        padding: 8,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',
    },
    form: {},
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 8,
        marginLeft: 5,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 20,
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