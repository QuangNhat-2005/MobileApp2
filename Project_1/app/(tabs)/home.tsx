import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import apiClient from '../../api/axiosConfig';
import { useSound } from '../../hooks/useSound';


interface DashboardStats {
    username: string;
    level: number;
    streak: number;
    dailyGoalProgress: number;
    dailyGoalTotal: number;
    avatarUrl: string;
}

export default function HomeScreen() {

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const playSound = useSound();


    const fetchDashboardData = async () => {

        try {
            const statsResponse = await apiClient.get('/api/dashboard/stats');
            setStats(statsResponse.data);
        } catch (error: any) {
            console.error("Lỗi khi lấy dữ liệu dashboard:", error);
            if (error.response?.status === 401) {
                router.replace('/');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {

            if (!stats) {
                setIsLoading(true);
            }
            fetchDashboardData();
        }, [])
    );

    const handleStartLesson = () => {
        playSound('click');
        router.push('/(tabs)/learn');
    };

    const handleReviewSession = () => {
        playSound('click');
        router.push('/reviewSession');
    };

    if (isLoading || !stats) {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centered}>
                <ActivityIndicator size="large" color="#A78BFA" />
            </LinearGradient>
        );
    }

    const progressValue = stats.dailyGoalTotal > 0 ? stats.dailyGoalProgress / stats.dailyGoalTotal : 0;
    const progressText = `${stats.dailyGoalProgress}/${stats.dailyGoalTotal}`;


    const fullAvatarUrl = `${apiClient.defaults.baseURL}/uploads/${stats.avatarUrl}`;

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Your Quest Awaits, {stats.username}!</Text>

                    <Image
                        key={fullAvatarUrl}
                        source={{ uri: fullAvatarUrl }}
                        style={styles.avatar}
                    />
                </View>

                <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>Today&apos;s Goal: Learn {stats.dailyGoalTotal} Words</Text>
                    <View style={styles.progressContainer}>
                        <Progress.Circle
                            size={120}
                            progress={progressValue}
                            showsText={true}
                            formatText={() => progressText}
                            textStyle={styles.progressText}
                            color={'#A78BFA'}
                            unfilledColor={'rgba(255,255,255,0.3)'}
                            borderWidth={0}
                            thickness={10}
                        />
                    </View>
                    <TouchableOpacity style={styles.startButton} onPress={handleStartLesson}>
                        <Text style={styles.startButtonText}>Start Lesson</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <FontAwesome5 name="star" size={18} color="#F59E0B" />
                        <Text style={styles.statText}>Level {stats.level}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="fire" size={20} color="#F472B6" />
                        <Text style={styles.statText}>{stats.streak} Day Streak!</Text>
                    </View>
                </View>

                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleReviewSession}>
                        <Ionicons name="refresh" size={28} color="#60A5FA" />
                        <Text style={styles.actionText}>Review Session</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/arena')}>
                        <MaterialCommunityIcons name="sword-cross" size={28} color="#A78BFA" />
                        <Text style={styles.actionText}>Enter Arena</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

// --- Styles  ---
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0eaff' },
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    greeting: { fontSize: 22, fontWeight: '600', color: '#1F2937', flex: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
    glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '500', color: '#374151', marginBottom: 20 },
    progressContainer: { marginBottom: 25 },
    progressText: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
    startButton: { backgroundColor: '#8B5CF6', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
    startButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    statsBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', marginBottom: 20 },
    statItem: { flexDirection: 'row', alignItems: 'center' },
    statText: { marginLeft: 8, fontSize: 16, fontWeight: '500', color: '#374151' },
    actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', width: '48%', height: 150, justifyContent: 'center', alignItems: 'center' },
    actionText: { marginTop: 10, fontSize: 16, fontWeight: '500', color: '#374151' },
});