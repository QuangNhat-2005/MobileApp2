import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../../../api/axiosConfig';
import { useSound } from '../../../../hooks/useSound';

interface Word {
    _id: string;
    text: string;
    proficiencyLevel?: number;
}

interface DeckDetails {
    _id: string;
    name: string;
    words: Word[];
    newWordsCount: number;
    progress: number;
}

export default function DeckDetailScreen() {
    const { deckId } = useLocalSearchParams<{ deckId: string }>();
    const [deckDetails, setDeckDetails] = useState<DeckDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const playSound = useSound();

    const fetchDeckDetails = useCallback(async () => {
        if (!deckId) return;
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/api/decks/${deckId}`);
            setDeckDetails(response.data);
        } catch (error: any) {
            console.error("Lỗi khi lấy chi tiết bộ từ:", error);
            if (error.response?.status === 401) {
                router.replace('/');
            }
        } finally {
            setIsLoading(false);
        }
    }, [deckId]);

    useFocusEffect(
        useCallback(() => {
            fetchDeckDetails();
        }, [fetchDeckDetails])
    );

    const handleStartLesson = () => {
        playSound('click');
        router.push({
            pathname: '/lessonSession',
            params: {
                deckId: deckId,
                deckName: deckDetails?.name || 'Lesson',
            },
        });
    };


    const handleWordPress = (wordId: string) => {
        playSound('wordclick');
        router.push(`/word/${wordId}`);
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#8B5CF6" /></View>;
    }

    if (!deckDetails) {
        return (
            <View style={styles.centered}>
                <Text>Không thể tải dữ liệu cho chủ đề này.</Text>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: '#8B5CF6' }}>Quay lại</Text></TouchableOpacity>
            </View>
        );
    }

    const getCardStyle = (item: Word) => {
        const level = item.proficiencyLevel || 0;
        if (level >= 5) return styles.wordCardMastered;
        if (level >= 3) return styles.wordCardGood;
        if (level >= 1) return styles.wordCardLearning;
        return null;
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{deckDetails.name}</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.headerProgressBarContainer}>
                    <View style={[styles.headerProgressBar, { width: `${deckDetails.progress}%` }]} />
                </View>
                <View style={styles.stepCard}>
                    <Text style={styles.cardTitle}>Your Next Step</Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleStartLesson}
                    >
                        <Text style={styles.primaryButtonText}>Start Lesson</Text>
                    </TouchableOpacity>
                    <Text style={styles.subText}>You have {deckDetails.newWordsCount} new words remaining.</Text>
                </View>
                <Text style={styles.exploreTitle}>Explore Words</Text>
                <View style={styles.wordGridContainer}>
                    {deckDetails.words.map((item) => (
                        <TouchableOpacity
                            key={item._id}
                            style={[styles.wordCard, getCardStyle(item)]}

                            onPress={() => handleWordPress(item._id)}
                        >
                            <Text style={styles.wordCardText}>{item.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
    headerProgressBarContainer: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 25 },
    headerProgressBar: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 2 },
    stepCard: {
        backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 30,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 5,
    },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 15 },
    primaryButton: { backgroundColor: '#8B5CF6', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginBottom: 10 },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    subText: { fontSize: 14, color: '#6B7280' },
    exploreTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
    wordGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    wordCard: {
        width: '48.5%', aspectRatio: 1, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E5E7EB',
    },
    wordCardLearning: { backgroundColor: '#FEF9C3', borderColor: '#FACC15' },
    wordCardGood: { backgroundColor: '#DCFCE7', borderColor: '#4ADE80' },
    wordCardMastered: { backgroundColor: '#E0F2F1', borderColor: '#009688' },
    wordCardText: {
        fontSize: 18, fontWeight: '500', color: '#374151', textAlign: 'center', paddingHorizontal: 5,
    },
});