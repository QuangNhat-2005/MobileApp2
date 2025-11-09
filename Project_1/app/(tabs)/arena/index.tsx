import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../../api/axiosConfig'; 

export default function VocabularySprintHub() {
    const router = useRouter();

   
    const [highScore, setHighScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const fetchHighScore = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/api/arena/high-score');
            setHighScore(response.data.highScore);
        } catch (error) {
            console.error("Không thể tải điểm cao:", error);
            
        } finally {
            setIsLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchHighScore();
        }, [])
    );

    const handleStartSprint = () => {
        router.push('/arena/sprint');
    };

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="flash" size={32} color="#4B5563" />
                    <Text style={styles.title}>Vocabulary Sprint</Text>
                </View>

                <View style={styles.mainCard}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleStartSprint}>
                        <Text style={styles.primaryButtonText}>START SPRINT</Text>
                    </TouchableOpacity>

                    <View style={styles.highScoreContainer}>
                        {isLoading ? (
                            <ActivityIndicator color="#6B7280" />
                        ) : (
                            <>
                                <Ionicons name="trophy" size={24} color="#F59E0B" />
                                <Text style={styles.highScoreText}>Your High Score: </Text>
                                <Text style={styles.highScoreValue}>{highScore.toLocaleString()}</Text>
                            </>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.leaderboardButton}>
                    <Ionicons name="stats-chart" size={20} color="#6B7280" />
                    <Text style={styles.leaderboardText}>Weekly Leaderboard</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 400,
        padding: 20,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#374151',
        marginLeft: 12,
    },
    mainCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 20,
        paddingHorizontal: 60,
        borderRadius: 30,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 15,
        marginBottom: 25,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    highScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 24, 
    },
    highScoreText: {
        fontSize: 16,
        color: '#4B5563',
        marginLeft: 8,
    },
    highScoreValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    leaderboardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    leaderboardText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
        marginLeft: 8,
        textDecorationLine: 'underline',
    },
});