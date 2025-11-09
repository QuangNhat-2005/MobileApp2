import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import apiClient from '../../api/axiosConfig';
interface WordDetails {
    _id: string;
    text: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    exampleTranslation?: string;
    imageName?: string;
    wordForms?: { form: string; word: string }[];
    synonyms?: string[];
    antonyms?: string[];
    relatedWords?: string[];
}

interface UserProgress {
    _id: string;
    proficiencyLevel: number;
    nextReviewDate: string;
}

type ActiveTab = 'Definition' | 'Connections' | 'Progress';

const Tag = ({ text }: { text: string }) => <View style={styles.tag}><Text style={styles.tagText}>{text}</Text></View>;

export default function WordDetailScreen() {
    const { wordId } = useLocalSearchParams<{ wordId: string }>();
    const [word, setWord] = useState<WordDetails | null>(null);
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTab>('Definition');
    const router = useRouter();

    const fetchWordDetails = async () => {
        if (!wordId) return;
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/api/words/${wordId}`);
            setWord(response.data.word);
            setProgress(response.data.progress);
        } catch (error: any) {
            console.error("Lỗi khi lấy chi tiết từ:", error);
            if (error.response?.status === 401) { router.replace('/'); }
        } finally { setIsLoading(false); }
    };

    useFocusEffect(React.useCallback(() => { fetchWordDetails(); }, [wordId]));

    const speak = (text: string) => Speech.speak(text, { language: 'en-US' });
    const handleGoBack = () => { if (router.canGoBack()) { router.back(); } else { router.replace('/(tabs)/learn'); } };

    const getLevelName = (level: number) => {
        if (level >= 5) return 'Mastered';
        if (level >= 3) return 'Good';
        if (level >= 1) return 'Learning';
        return 'Not Learned';
    };
    const getLevelColor = (level: number) => {
        if (level >= 5) return '#009688';
        if (level >= 3) return '#4ADE80';
        if (level >= 1) return '#FACC15';
        return '#9CA3AF';
    };
    const formatReviewDate = (dateString: string) => {
        const now = new Date();
        const reviewDate = new Date(dateString);
        const diffTime = reviewDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `In ${diffDays} days`;
    };

    if (isLoading || !word) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#8B5CF6" /></View>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Connections':
                // --- THAY ĐỔI 2: CẬP NHẬT LOGIC HIỂN THỊ ---
                const hasConnections = (word.wordForms && word.wordForms.length > 0) ||
                    (word.synonyms && word.synonyms.length > 0) ||
                    (word.antonyms && word.antonyms.length > 0) ||
                    (word.relatedWords && word.relatedWords.length > 0);

                if (!hasConnections) {
                    return <Text style={styles.placeholderText}>No connection data available for this word yet.</Text>;
                }
                return (
                    <View>
                        {word.synonyms && word.synonyms.length > 0 && (
                            <View style={styles.contentSection}>
                                <Text style={styles.contentLabel}>Synonyms</Text>
                                <View style={styles.tagContainer}>{word.synonyms.map((s, i) => <Tag key={i} text={s} />)}</View>
                            </View>
                        )}
                        {word.antonyms && word.antonyms.length > 0 && (
                            <View style={styles.contentSection}>
                                <Text style={styles.contentLabel}>Antonyms</Text>
                                <View style={styles.tagContainer}>{word.antonyms.map((a, i) => <Tag key={i} text={a} />)}</View>
                            </View>
                        )}
                        {word.relatedWords && word.relatedWords.length > 0 && (
                            <View style={styles.contentSection}>
                                <Text style={styles.contentLabel}>Related Words</Text>
                                <View style={styles.tagContainer}>{word.relatedWords.map((r, i) => <Tag key={i} text={r} />)}</View>
                            </View>
                        )}
                        {word.wordForms && word.wordForms.length > 0 && (
                            <View style={styles.contentSection}>
                                <Text style={styles.contentLabel}>Word Forms</Text>
                                {word.wordForms.map((form, i) => <Text key={i} style={styles.connectionText}><Text style={{ fontWeight: 'bold' }}>{form.form}:</Text> {form.word}</Text>)}
                            </View>
                        )}
                    </View>
                );
            // ============================================
            case 'Progress':
                const level = progress?.proficiencyLevel || 0;
                return (
                    <View>
                        <View style={styles.contentSection}>
                            <Text style={styles.contentLabel}>Current Level</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.levelDot, { backgroundColor: getLevelColor(level) }]} />
                                <Text style={styles.contentValue}>{getLevelName(level)}</Text>
                            </View>
                        </View>
                        <View style={styles.contentSection}>
                            <Text style={styles.contentLabel}>Strength</Text>
                            <Progress.Bar progress={level / 5} width={null} color={getLevelColor(level)} unfilledColor="#E5E7EB" borderWidth={0} height={8} />
                        </View>
                        {progress && (
                            <View style={styles.contentSection}>
                                <Text style={styles.contentLabel}>Next Review</Text>
                                <Text style={styles.contentValue}>{formatReviewDate(progress.nextReviewDate)}</Text>
                            </View>
                        )}
                    </View>
                );
            case 'Definition':
            default:
                return (
                    <>
                        <View style={styles.contentSection}>
                            <Text style={styles.contentLabel}>Meaning</Text>
                            <Text style={styles.contentValue}>{word.meaning}</Text>
                        </View>
                        {word.example && (
                            <View style={styles.contentSection}>
                                <Text style={styles.contentLabel}>Example in Context</Text>
                                <Text style={styles.exampleText}>{word.example}</Text>
                                {word.exampleTranslation && (
                                    <Text style={styles.exampleTranslation}>{word.exampleTranslation}</Text>
                                )}
                            </View>
                        )}
                    </>
                );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#1F2937" /></TouchableOpacity>
                <View style={styles.headerLine} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.wordDisplayContainer}>
                    <Text style={styles.wordText}>{word.text.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => speak(word.text)} style={styles.speakButton}><Ionicons name="volume-high" size={24} color="#fff" /></TouchableOpacity>
                </View>
                <Text style={styles.ipaText}>{word.pronunciation}</Text>
                <View style={styles.mainCard}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={[styles.tabButton, activeTab === 'Definition' && styles.activeTabButton]} onPress={() => setActiveTab('Definition')}><Text style={[styles.tabText, activeTab === 'Definition' && styles.activeTabText]}>Definition</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.tabButton, activeTab === 'Connections' && styles.activeTabButton]} onPress={() => setActiveTab('Connections')}><Text style={[styles.tabText, activeTab === 'Connections' && styles.activeTabText]}>Connections</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.tabButton, activeTab === 'Progress' && styles.activeTabButton]} onPress={() => setActiveTab('Progress')}><Text style={[styles.tabText, activeTab === 'Progress' && styles.activeTabText]}>Progress</Text></TouchableOpacity>
                    </View>
                    <View style={styles.tabContent}>{renderContent()}</View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { padding: 10 },
    headerLine: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginLeft: 15 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    wordDisplayContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    wordText: { fontSize: 40, fontWeight: 'bold', color: '#111827', flexShrink: 1 },
    speakButton: { backgroundColor: '#A78BFA', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 15, flexShrink: 0 },
    ipaText: { fontSize: 18, color: '#6B7280', marginTop: 4, marginBottom: 30 },
    mainCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 16, padding: 4 },
    tabButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    activeTabButton: { backgroundColor: '#FFFFFF', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    activeTabText: { color: '#4F46E5' },
    tabContent: { paddingVertical: 20, paddingHorizontal: 12, minHeight: 250 },
    contentSection: { marginBottom: 25 },
    contentLabel: { fontSize: 14, fontWeight: '500', color: '#9CA3AF', marginBottom: 8 },
    contentValue: { fontSize: 20, color: '#1F2937', fontWeight: '600' },
    exampleText: { fontSize: 16, color: '#374151', lineHeight: 24 },
    exampleTranslation: { fontSize: 14, color: '#9CA3AF', marginTop: 8, fontStyle: 'italic' },
    placeholderText: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
    tagText: { color: '#4338CA', fontWeight: '500' },
    connectionText: { fontSize: 16, color: '#374151', lineHeight: 24 },
    levelDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
});