import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../api/axiosConfig';
import { useSound } from '../../hooks/useSound';

interface UserProfile {
    username: string;
    email: string;
    level: number;
    xpForCurrentLevel: number;
    xpToNextLevel: number;
    streak: number;
    wordsLearned: number;
    avatarUrl: string;
}

const SettingsRow = ({ icon, text, action, isDestructive = false }: { icon: any, text: string, action: () => void, isDestructive?: boolean }) => (
    <TouchableOpacity style={styles.settingsRow} onPress={action}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name={icon} size={22} color={isDestructive ? '#EF4444' : '#374151'} />
            <Text style={[styles.settingsText, isDestructive && { color: '#EF4444' }]}>{text}</Text>
        </View>
        {!isDestructive && <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const playSound = useSound();

    const fetchProfileData = async () => {
        try {
            const response = await apiClient.get('/api/dashboard/profile');
            setUserProfile(response.data);
        } catch (error: any) {
            console.error("Lỗi khi lấy dữ liệu profile:", error);
            if (error.response?.status === 401) {
                router.replace('/');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(React.useCallback(() => {
        if (!userProfile) {
            setIsLoading(true);
        }
        fetchProfileData();
    }, []));

    const handleLogout = async () => {
        const logoutAction = async () => {
            if (Platform.OS === 'web') {
                localStorage.removeItem('userToken');
            } else {
                await SecureStore.deleteItemAsync('userToken');
            }
            delete apiClient.defaults.headers.common['x-auth-token'];
            router.replace('/');
        };
        if (Platform.OS !== 'web') {
            Alert.alert("Log Out", "Are you sure you want to log out?", [{ text: "Cancel", style: "cancel" }, { text: "Log Out", style: "destructive", onPress: logoutAction }]);
        } else {
            if (confirm("Are you sure you want to log out?")) {
                logoutAction();
            }
        }
    };

    const handleResetProgress = async () => {
        const resetAction = async () => {
            try {
                setIsLoading(true);
                await apiClient.post('/api/dashboard/reset-progress');
                await fetchProfileData();
            } catch (error) {
                console.error("Lỗi khi reset:", error);
                Alert.alert("Error", "Could not reset progress. Please try again.");
            }
        };
        const alertTitle = "Reset All Progress";
        const alertMessage = "Are you absolutely sure? This will permanently delete all your learning progress, XP, level, and streak. This action cannot be undone.";
        if (Platform.OS !== 'web') {
            Alert.alert(alertTitle, alertMessage, [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: resetAction }]);
        } else {
            if (confirm(`${alertTitle}\n\n${alertMessage}`)) {
                resetAction();
            }
        }
    };

    const handleTimeTravel = async () => {
        try {
            const response = await apiClient.post('/api/debug/time-travel');
            const message = response.data.message || "Time travel successful!";
            if (Platform.OS === 'web') {
                alert(message);
            } else {
                Alert.alert("Success", message);
            }
        } catch (error: any) {
            console.error("Lỗi khi tua nhanh thời gian:", error);
            const errorMessage = error.response?.data?.message || "An error occurred.";
            if (Platform.OS === 'web') {
                alert(`Error: ${errorMessage}`);
            } else {
                Alert.alert("Error", errorMessage);
            }
        }
    };

    const handlePressWithSound = (action: () => void) => {
        playSound('click');
        action();
    };

    if (isLoading || !userProfile) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#A78BFA" /></View>;
    }

    const progressPercent = userProfile.xpToNextLevel > 0 ? (userProfile.xpForCurrentLevel / userProfile.xpToNextLevel) * 100 : 0;
    const fullAvatarUrl = `${apiClient.defaults.baseURL}/uploads/${userProfile.avatarUrl}`;

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* --- AVATAR SECTION --- */}
                <View style={styles.glassCard}>
                    <Image
                        key={fullAvatarUrl}
                        source={{ uri: fullAvatarUrl }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{userProfile.username}</Text>
                </View>

                {/* --- PROGRESS SECTION --- */}
                <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>Progress Overview</Text>
                    <Text style={styles.levelText}>Level {userProfile.level}: {userProfile.xpForCurrentLevel.toLocaleString()} / {userProfile.xpToNextLevel.toLocaleString()} XP</Text>
                    <View style={styles.progressBarContainer}><View style={[styles.progressBar, { width: `${progressPercent}%` }]} /></View>
                    <View style={styles.statsContainer}>
                        <Text style={styles.stat}><FontAwesome5 name="book-open" /> {userProfile.wordsLearned} Words</Text>
                        <Text style={styles.stat}><MaterialCommunityIcons name="fire" /> {userProfile.streak} Days</Text>
                        <Text style={styles.stat}><FontAwesome5 name="trophy" /> 0 Wins</Text>
                    </View>
                </View>

                {/* --- SETTINGS SECTION --- */}
                <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>Settings</Text>

                    <SettingsRow
                        icon="pencil-circle-outline"
                        text="Edit Profile"
                        action={() => handlePressWithSound(() => router.push('/editProfile'))}
                    />

                    <SettingsRow
                        icon="shield-lock-outline"
                        text="Account Security"
                        action={() => handlePressWithSound(() => router.push('/accountSecurity'))}
                    />

                    <SettingsRow icon="clock-fast" text="DEV: Fast-Forward Time" action={() => handlePressWithSound(handleTimeTravel)} />
                    <SettingsRow icon="delete-sweep-outline" text="Reset Progress" action={() => handlePressWithSound(handleResetProgress)} isDestructive={true} />
                    <SettingsRow icon="logout" text="Log Out" action={() => handlePressWithSound(handleLogout)} isDestructive={true} />
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0eaff' },
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
    glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)', marginBottom: 20, alignItems: 'center', },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff', marginBottom: 15 },
    name: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#374151', alignSelf: 'flex-start', marginBottom: 15 },
    levelText: { fontSize: 14, color: '#4B5563', alignSelf: 'flex-start', marginBottom: 8 },
    progressBarContainer: { width: '100%', height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4, marginBottom: 15 },
    progressBar: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 4 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    stat: { fontSize: 14, color: '#4B5563' },
    settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 12 },
    settingsText: { fontSize: 16, color: '#374151', marginLeft: 15 },
});