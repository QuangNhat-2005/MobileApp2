import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';


import apiClient from '../../api/axiosConfig';
import { StatItem } from '../../components/home/StatItem';
import { GlassCard } from '../../components/ui/GlassCard';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useSound } from '../../hooks/useSound';

export default function HomeScreen() {
    const router = useRouter();
    const playSound = useSound();
    const { stats, isLoading } = useDashboardData();

    const handleStartLesson = () => {
        playSound('click');
        router.push('/(tabs)/learn');
    };

    // Hàm xử lý khi bấm vào Avatar
    const handleProfilePress = () => {
        playSound('click');
        router.push('/editProfile'); 
    };

    if (isLoading || !stats) {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centered}>
                <ActivityIndicator size="large" color="#A78BFA" />
            </LinearGradient>
        );
    }

    const progressValue = stats.dailyGoalTotal > 0 ? stats.dailyGoalProgress / stats.dailyGoalTotal : 0;
    const fullAvatarUrl = `${apiClient.defaults.baseURL}/uploads/${stats.avatarUrl}`;

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Your Quest Awaits, {stats.username}!</Text>

                   
                    <TouchableOpacity onPress={handleProfilePress}>
                        <Image
                            key={fullAvatarUrl}
                            source={{ uri: fullAvatarUrl }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                {/* Main Goal Card */}
                <GlassCard>
                    <Text style={styles.cardTitle}>Today&apos;s Goal: Learn {stats.dailyGoalTotal} Words</Text>
                    <View style={styles.progressContainer}>
                        <Progress.Circle
                            size={120}
                            progress={progressValue}
                            showsText={true}
                            formatText={() => `${stats.dailyGoalProgress}/${stats.dailyGoalTotal}`}
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
                </GlassCard>

                {/* Stats Bar */}
                <GlassCard style={styles.statsBar}>
                    <StatItem icon="star" value={`Level ${stats.level}`} label="" color="#F59E0B" />
                    <StatItem icon="fire" value={stats.streak} label="Day Streak!" color="#F472B6" />
                </GlassCard>

                {/* Action Grid */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/reviewSession')}>
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

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0eaff' },
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    greeting: { fontSize: 22, fontWeight: '600', color: '#1F2937', flex: 1 },
    avatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: '#fff', backgroundColor: '#ddd' },
    cardTitle: { fontSize: 18, fontWeight: '500', color: '#374151', marginBottom: 20 },
    progressContainer: { marginBottom: 25 },
    progressText: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
    startButton: { backgroundColor: '#8B5CF6', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 5 },
    startButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15 },
    actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', width: '48%', height: 150, justifyContent: 'center', alignItems: 'center' },
    actionText: { marginTop: 10, fontSize: 16, fontWeight: '500', color: '#374151' },
});