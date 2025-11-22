import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import apiClient from '../../../api/axiosConfig';
import { useSound } from '../../../hooks/useSound';

interface Deck {
    _id: string;
    name: string;
    wordCount: number;
    progress: number;
    iconName: string;
}

export default function LearnScreen() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    
    const [isFocused, setIsFocused] = useState(false);

    const router = useRouter();
    const playSound = useSound();

    const fetchDecks = async () => {
        try {
            const response = await apiClient.get('/api/decks');
            setDecks(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách bộ từ:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchDecks();
        }, [])
    );

    const handleDeckPress = (deckId: string) => {
        playSound('click');
        router.push(`/learn/deck/${deckId}`);
    };

    const filteredDecks = decks.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centered}>
                <ActivityIndicator size="large" color="#A78BFA" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Choose Your Topic</Text>
            </View>


            <View style={[
                styles.searchContainer,
                isFocused && styles.searchContainerFocused 
            ]}>
                <Ionicons
                    name="search"
                    size={22}
                    
                    color={isFocused ? "#8B5CF6" : "#9CA3AF"}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={[
                        styles.searchInput,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                    ]}
                    placeholder="Search for topics..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}

                   
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}

                   
                    cursorColor="#8B5CF6"
                    selectionColor="rgba(139, 92, 246, 0.3)"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {filteredDecks.length > 0 ? (
                    filteredDecks.map((deck) => (
                        <TouchableOpacity
                            key={deck._id}
                            style={styles.deckCard}
                            onPress={() => handleDeckPress(deck._id)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={deck.iconName as any || 'book'}
                                    size={32}
                                    color="#8B5CF6"
                                />
                            </View>

                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.deckName}>{deck.name}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
                                </View>

                                <Text style={styles.wordCount}>{deck.wordCount} Words</Text>

                                <View style={styles.progressWrapper}>
                                    <Progress.Bar
                                        progress={deck.progress / 100}
                                        width={null}
                                        height={6}
                                        color="#A78BFA"
                                        unfilledColor="#E5E7EB"
                                        borderWidth={0}
                                        style={{ flex: 1, marginRight: 10 }}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="text-search" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No topics found matching &quot;{searchQuery}&quot;</Text>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },


    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 15,
        height: 55, 
        borderRadius: 16, 
        borderWidth: 1.5,
        borderColor: 'transparent', 


        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },

    searchContainerFocused: {
        borderColor: '#8B5CF6', 
        backgroundColor: '#F5F3FF', 
        shadowColor: "#8B5CF6", 
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        height: '100%',
        fontWeight: '500' 
    },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },


    deckCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 60, height: 60, borderRadius: 16, backgroundColor: '#F3E8FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    deckName: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    wordCount: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
    progressWrapper: { flexDirection: 'row', alignItems: 'center' },
    progressText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },


    emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.7 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#6B7280', textAlign: 'center' },
});