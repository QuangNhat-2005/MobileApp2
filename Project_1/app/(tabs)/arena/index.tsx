import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../../api/axiosConfig';
import { GlassCard } from '../../../components/ui/GlassCard';
import { useSound } from '../../../hooks/useSound';

export default function ArenaScreen() {
    const [highScore, setHighScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const playSound = useSound();

    const fetchHighScore = async () => {
        try {
            const response = await apiClient.get('/api/arena/high-score');
            setHighScore(response.data.highScore);
        } catch (error) {
            console.error("Lỗi lấy điểm cao:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchHighScore();
        }, [])
    );

    const handleStartSprint = () => {
        playSound('click');
        router.push('/(tabs)/arena/sprint');
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centered}>
                <ActivityIndicator size="large" color="#A78BFA" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Battle Arena</Text>
                    <Text style={styles.headerSubtitle}>Test your limits</Text>
                </View>

                <View style={styles.heroContainer}>
                    <View style={styles.heroIconCircle}>
                        <MaterialCommunityIcons name="sword-cross" size={50} color="#fff" />
                    </View>
                    <Text style={styles.heroText}>Vocabulary Sprint</Text>
                    <View style={styles.tagContainer}>
                        <View style={styles.tag}><Text style={styles.tagText}>SPEED</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>ACCURACY</Text></View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <GlassCard style={styles.statCard}>
                        <View style={styles.statIconBg}>
                            <FontAwesome5 name="trophy" size={18} color="#F59E0B" />
                        </View>
                        <Text style={styles.statLabel}>High Score</Text>
                        <Text style={styles.statValue}>{highScore}</Text>
                    </GlassCard>

                    <GlassCard style={styles.statCard}>
                        <View style={[styles.statIconBg, { backgroundColor: '#E0E7FF' }]}>
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#6366F1" />
                        </View>
                        <Text style={styles.statLabel}>Mode</Text>
                        <Text style={styles.statValue}>Blitz</Text>
                    </GlassCard>
                </View>

                {/* --- SỬA LỖI NÚT START Ở ĐÂY --- */}
                <TouchableOpacity
                    style={styles.playButtonContainer}
                    onPress={handleStartSprint}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.playButton}
                    >
                        <Text style={styles.playButtonText}>START CHALLENGE</Text>
                        <View style={styles.playIconCircle}>
                            <Ionicons name="play" size={20} color="#8B5CF6" style={{ marginLeft: 2 }} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Game Rules</Text>
                    <View style={styles.ruleItem}>
                        <View style={styles.ruleBullet} />
                        <Text style={styles.ruleText}>Answer as many words as possible in <Text style={{ fontWeight: 'bold', color: '#8B5CF6' }}>60s</Text>.</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <View style={styles.ruleBullet} />
                        <Text style={styles.ruleText}>Correct answer: <Text style={{ fontWeight: 'bold', color: '#10B981' }}>+10 points</Text>.</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <View style={styles.ruleBullet} />
                        <Text style={styles.ruleText}>Wrong answer: No penalty, just lost time.</Text>
                    </View>
                </View>

            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 130 },
    header: { marginBottom: 25 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#1F2937', letterSpacing: 0.5 },
    headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
    heroContainer: { backgroundColor: '#fff', borderRadius: 24, padding: 25, alignItems: 'center', shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5, marginBottom: 20, position: 'relative', overflow: 'hidden' },
    heroIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    heroText: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 10 },
    tagContainer: { flexDirection: 'row', gap: 10 },
    tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    tagText: { fontSize: 12, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5 },
    statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    statCard: { flex: 1, padding: 15, alignItems: 'flex-start', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)' },
    statIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    statValue: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginTop: 2 },

    // --- STYLE ĐÃ SỬA CHO NÚT START ---
    playButtonContainer: {
        marginBottom: 30,
        borderRadius: 32, // Bo tròn container khớp với nút
        backgroundColor: 'transparent', // Nền trong suốt để không bị lòi màu trắng
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
    },
    playButton: {
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingLeft: 30
    },
    playButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    playIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    infoSection: { paddingHorizontal: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 15 },
    ruleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    ruleBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB', marginRight: 12 },
    ruleText: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
});