import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar, ViewStyle, TextStyle, ScrollView } from 'react-native';
import apiClient from '../../../api/axiosConfig';
import { useSound } from '../../../hooks/useSound';

interface Option { text: string; isCorrect: boolean; }
interface Question {
    wordId: string;
    promptText: string;
    options: Option[];
}
interface FinalResult {
    score: number;
    correctCount: number;
    incorrectCount: number;
    newHighScore: boolean;
}
type GamePhase = 'loading' | 'countdown' | 'playing' | 'results';

const SPRINT_DURATION = 60;

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

export default function SprintScreen() {
    const router = useRouter();
    const playSound = useSound();

    const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(SPRINT_DURATION);
    const [streak, setStreak] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [feedback, setFeedback] = useState<{ selected: string; correct: boolean } | null>(null);
    const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

    const scoreRef = useRef(0);
    const correctCountRef = useRef(0);
    const wrongCountRef = useRef(0);
    const streakRef = useRef(0);

    const gameTimerRef = useRef<any>(null);
    const countdownTimerRef = useRef<any>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await apiClient.get('/api/arena/sprint-questions');
                if (response.data && response.data.length > 0) {
                    setQuestions(response.data);
                    setGamePhase('countdown');
                } else {
                    alert("You need to learn at least 4 words to start a Sprint!");
                    handleBack();
                }
            } catch (error: any) {
                alert(error.response?.data?.msg || "Could not start the game. Please try again.");
                handleBack();
            }
        };
        fetchQuestions();
        
        return () => {
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        };
    }, []);

    const handleBack = () => {
        playSound('click');
        if (Platform.OS === 'web') {
            window.location.href = '/arena';
        } else {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)/arena');
            }
        }
    };

    useEffect(() => {
        if (gamePhase === 'countdown') {
            countdownTimerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownTimerRef.current);
                        setGamePhase('playing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(countdownTimerRef.current);
    }, [gamePhase]);

    useEffect(() => {
        if (gamePhase === 'playing') {
            gameTimerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(gameTimerRef.current);
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(gameTimerRef.current);
    }, [gamePhase]);

    const handleAnswerSelect = (option: Option) => {
        if (feedback) return;

        setFeedback({ selected: option.text, correct: option.isCorrect });

        if (option.isCorrect) {
            playSound('correct');
            streakRef.current += 1;
            const streakBonus = streakRef.current % 5 === 0 ? 50 : 0;
            scoreRef.current += (10 + streakBonus);
            correctCountRef.current += 1;
            setStreak(streakRef.current);
            setScore(scoreRef.current);
        } else {
            playSound('incorrect');
            streakRef.current = 0;
            wrongCountRef.current += 1;
            setStreak(0);
        }

        setTimeout(() => {
            setFeedback(null);
            setCurrentIndex(prev => (prev + 1) % questions.length);
        }, 500);
    };

    const endGame = async () => {
        setGamePhase('loading');
        playSound('complete');

        try {
            const finalScore = scoreRef.current;
            const finalCorrect = correctCountRef.current;
            const finalWrong = wrongCountRef.current;

            const response = await apiClient.post('/api/arena/sprint-results', { score: finalScore });
            
            setFinalResult({
                score: finalScore,
                correctCount: finalCorrect,
                incorrectCount: finalWrong,
                newHighScore: response.data.newHighScore,
            });
            setGamePhase('results');
        } catch (error) {
            console.error("Failed to save sprint results:", error);
            alert("Could not save your score. Please check your connection.");
            handleBack();
        }
    };

    const handlePlayAgain = () => {
        playSound('click');
        setScore(0); scoreRef.current = 0;
        setStreak(0); streakRef.current = 0;
        correctCountRef.current = 0;
        wrongCountRef.current = 0;
        setTimeLeft(SPRINT_DURATION);
        setCurrentIndex(0);
        setFinalResult(null);
        setCountdown(3);
        setQuestions(shuffleArray(questions));
        setGamePhase('countdown');
    };

    if (gamePhase === 'loading') {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#A78BFA" />
            </LinearGradient>
        );
    }

    if (gamePhase === 'countdown') {
        return (
            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.centerContainer}>
                <Text style={styles.countdownLabel}>Get Ready!</Text>
                <Text style={styles.countdownText}>{countdown}</Text>
            </LinearGradient>
        );
    }

    if (gamePhase === 'results') {
        return (
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.centerContainer}>
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Time&apos;s Up!</Text>
                    
                    {finalResult?.newHighScore && (
                        <View style={styles.highScoreBadge}>
                            <FontAwesome5 name="crown" size={16} color="#B45309" />
                            <Text style={styles.newHighScoreText}>NEW HIGH SCORE!</Text>
                        </View>
                    )}

                    <Text style={styles.scoreLabel}>TOTAL SCORE</Text>
                    <Text style={styles.resultScore}>{finalResult?.score.toLocaleString()}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                            <Text style={styles.statValue}>{finalResult?.correctCount}</Text>
                            <Text style={styles.statLabel}>Correct</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="close-circle" size={32} color="#EF4444" />
                            <Text style={styles.statValue}>{finalResult?.incorrectCount}</Text>
                            <Text style={styles.statLabel}>Wrong</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handlePlayAgain}>
                        <Text style={styles.primaryButtonText}>Play Again</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Back to Arena</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return <View style={styles.centerContainer}><ActivityIndicator /></View>;

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.gameContainer}>
            <StatusBar barStyle="dark-content" />
            
          
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={[styles.statBox, timeLeft <= 10 && styles.statBoxDanger]}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color={timeLeft <= 10 ? "#EF4444" : "#6B7280"} />
                        <Text style={[styles.statText, timeLeft <= 10 && styles.textDanger]}>{timeLeft}s</Text>
                    </View>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>SCORE</Text>
                        <Text style={styles.scoreText}>{score}</Text>
                    </View>

                    <View style={[styles.statBox, streak > 2 && styles.statBoxFire]}>
                        <MaterialCommunityIcons name="fire" size={20} color={streak > 2 ? "#F59E0B" : "#6B7280"} />
                        <Text style={[styles.statText, streak > 2 && styles.textFire]}>{streak}</Text>
                    </View>
                </View>

                <View style={styles.questionArea}>
                    <View style={styles.questionCard}>
                        <Text style={styles.promptLabel}>
                            {currentQuestion.promptText.includes(' ') ? 'What is the meaning of:' : 'Choose the word for:'}
                        </Text>
                        <Text style={styles.promptWord}>{currentQuestion.promptText}</Text>
                    </View>
                </View>

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = feedback?.selected === option.text;
                        const isCorrect = feedback?.correct;

                        let buttonStyle: ViewStyle = { ...styles.optionButton };
                        let textStyle: TextStyle = { ...styles.optionText };
                        let iconName = null;

                        if (isSelected) {
                            if (isCorrect) {
                                Object.assign(buttonStyle, styles.correctOption);
                                Object.assign(textStyle, styles.textWhite);
                                iconName = "checkmark-circle";
                            } else {
                                Object.assign(buttonStyle, styles.incorrectOption);
                                Object.assign(textStyle, styles.textWhite);
                                iconName = "close-circle";
                            }
                        } else if (feedback && option.isCorrect) {
                            Object.assign(buttonStyle, styles.correctOption, { opacity: 0.7 });
                            Object.assign(textStyle, styles.textWhite);
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                style={buttonStyle}
                                onPress={() => handleAnswerSelect(option)}
                                disabled={!!feedback}
                                activeOpacity={0.8}
                            >
                                <Text style={textStyle}>{option.text}</Text>
                                {iconName && (
                                    <Ionicons name={iconName as any} size={24} color="#fff" style={{position: 'absolute', right: 20}} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                
                <Text style={styles.footerText}>Question {currentIndex + 1}</Text>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    gameContainer: { flex: 1 },
    
    // --- STYLE QUAN TRỌNG ĐỂ FIX LỖI CHE MẤT ---
    scrollContent: { 
        paddingTop: 60, 
        paddingHorizontal: 20,
        paddingBottom: 160 // Tăng khoảng trống đáy lên cực lớn
    },

    countdownLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 24, fontWeight: '600', marginBottom: 20 },
    countdownText: { fontSize: 120, fontWeight: 'bold', color: '#fff' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
    statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    statBoxDanger: { backgroundColor: '#FEE2E2' },
    statBoxFire: { backgroundColor: '#FEF3C7' },
    statText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    textDanger: { color: '#EF4444' },
    textFire: { color: '#D97706' },
    
    scoreContainer: { alignItems: 'center' },
    scoreLabel: { fontSize: 10, fontWeight: 'bold', color: '#8B5CF6', letterSpacing: 1 },
    scoreText: { fontSize: 32, fontWeight: '900', color: '#8B5CF6' },

    questionArea: { marginBottom: 20 },
    questionCard: { backgroundColor: '#fff', borderRadius: 24, padding: 30, alignItems: 'center', justifyContent: 'center', shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, minHeight: 200 },
    promptLabel: { fontSize: 14, color: '#6B7280', textTransform: 'uppercase', marginBottom: 15, fontWeight: '600' },
    promptWord: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },

    optionsContainer: { gap: 12, marginBottom: 20 },
    optionButton: { backgroundColor: '#fff', paddingVertical: 18, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 2, borderColor: 'transparent' },
    optionText: { fontSize: 18, fontWeight: '600', color: '#4B5563' },
    
    correctOption: { backgroundColor: '#10B981', borderColor: '#059669' },
    incorrectOption: { backgroundColor: '#EF4444', borderColor: '#B91C1C' },
    textWhite: { color: '#fff' },

    footerText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginBottom: 20 },

    resultCard: { backgroundColor: '#fff', width: '100%', borderRadius: 30, padding: 30, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
    highScoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20, gap: 6 },
    newHighScoreText: { color: '#B45309', fontWeight: 'bold', fontSize: 12 },
    
    resultScore: { fontSize: 64, fontWeight: '900', color: '#8B5CF6', marginBottom: 30 },
    statsRow: { flexDirection: 'row', gap: 40, marginBottom: 40 },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 5 },
    statLabel: { fontSize: 12, color: '#6B7280' },
    
    primaryButton: { backgroundColor: '#8B5CF6', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, shadowColor: "#8B5CF6", shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, elevation: 5 },
    primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    secondaryButton: { paddingVertical: 12 },
    secondaryButtonText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
});