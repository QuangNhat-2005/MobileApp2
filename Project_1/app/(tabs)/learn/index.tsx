import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import apiClient from '../../../api/axiosConfig';
import { useSound } from '../../../hooks/useSound';

interface Deck {
    _id: string;
    name: string;
    iconName: keyof typeof Ionicons.glyphMap;
    wordCount: number;
    progress?: number;
    isCompleted?: boolean;
}

const TopicCard = ({ deck, onPress }: { deck: Deck; onPress: () => void }) => {
    const isCompleted = deck.isCompleted || deck.progress === 100;

    return (
        <TouchableOpacity style={styles.deckCard} onPress={onPress}>
            <View style={styles.deckIconContainer}>
                <Ionicons name={deck.iconName} size={24} color="#8B5CF6" />
            </View>
            <View style={styles.deckInfo}>
                <Text style={styles.deckName}>{deck.name}</Text>
                <Text style={styles.deckWordCount}>{deck.wordCount} Words</Text>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${deck.progress || 0}%` }]} />
                </View>
            </View>
            {isCompleted && <Ionicons name="checkmark-circle" size={24} color="#22C55E" style={{ marginRight: 10 }} />}
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>
    );
};

export default function ChooseTopicScreen() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const playSound = useSound();

    const fetchDecks = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/api/decks');
            setDecks(response.data);
            setError(null);
        } catch (err: any) {
            console.error("Lỗi khi lấy danh sách bộ từ:", err);
            if (err.response?.status === 401) {
                router.replace('/');
            } else {
                setError("Không thể tải danh sách chủ đề. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(React.useCallback(() => {
        fetchDecks();
    }, []));


    const handleTopicPress = (deckId: string) => {
        playSound('click');
        router.push(`/learn/deck/${deckId}`);
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centered}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchDecks}>
                    <Text style={styles.retryButton}>Thử lại</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            <FlatList
                data={decks}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TopicCard
                        deck={item}

                        onPress={() => handleTopicPress(item._id)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={(
                    <>
                        <Text style={styles.title}>Choose Your Topic</Text>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                            <TextInput
                                placeholder="Search for topics..."
                                style={styles.searchInput}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </>
                )}
            />
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { flex: 1 },
    listContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 30, paddingHorizontal: 15, marginBottom: 20 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 50, fontSize: 16, color: '#1F2937' },
    deckCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20, padding: 15, marginBottom: 15,
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 1)',
    },
    deckIconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(139, 92, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    deckInfo: { flex: 1 },
    deckName: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    deckWordCount: { fontSize: 14, color: '#6B7280', marginVertical: 4 },
    progressBarContainer: { height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginTop: 5, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 3 },
    errorText: { fontSize: 18, color: '#EF4444', textAlign: 'center', marginBottom: 20 },
    retryButton: { fontSize: 16, color: '#8B5CF6', fontWeight: 'bold' },
});