import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../../api/axiosConfig';

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


export default function SprintScreen() {
    const router = useRouter();

    const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(SPRINT_DURATION);
    const [streak, setStreak] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [feedback, setFeedback] = useState<{ selected: string; correct: boolean } | null>(null);
    const [incorrectWords, setIncorrectWords] = useState<Question[]>([]);
    const [finalResult, setFinalResult] = useState<FinalResult | null>(null);


    const gameTimerRef = useRef<NodeJS.Timeout>();
    const countdownTimerRef = useRef<NodeJS.Timeout>();


    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await apiClient.get('/api/arena/sprint-questions');
                if (response.data && response.data.length > 0) {
                    setQuestions(response.data);
                    setGamePhase('countdown');
                } else {
                    alert("You need to learn at least 4 words to start a Sprint!");
                    router.back();
                }
            } catch (error: any) {
                alert(error.response?.data?.msg || "Could not start the game. Please try again.");
                router.back();
            }
        };
        fetchQuestions();
    }, []);


    useEffect(() => {
        if (gamePhase === 'countdown') {
            countdownTimerRef.current = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(countdownTimerRef.current);
    }, [gamePhase]);


    useEffect(() => {
        if (countdown === 0) {
            clearInterval(countdownTimerRef.current);
            setGamePhase('playing');
        }
    }, [countdown]);


    useEffect(() => {
        if (gamePhase === 'playing') {
            gameTimerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(gameTimerRef.current);
    }, [gamePhase]);


    useEffect(() => {
        if (timeLeft === 0) {
            clearInterval(gameTimerRef.current);
            endGame();
        }
    }, [timeLeft]);


    const handleAnswerSelect = (option: Option) => {
        if (feedback) return;

        setFeedback({ selected: option.text, correct: option.isCorrect });

        if (option.isCorrect) {
            const streakBonus = (streak + 1) % 5 === 0 ? 50 : 0;
            setScore(prev => prev + 10 + streakBonus);
            setStreak(prev => prev + 1);
        } else {
            setStreak(0);
            setIncorrectWords(prev => [...prev, questions[currentIndex]]);
        }


        setTimeout(() => {
            setFeedback(null);
            setCurrentIndex(prev => (prev + 1) % questions.length);
        }, 500);
    };


    const endGame = async () => {
        setGamePhase('loading');
        try {
            const response = await apiClient.post('/api/arena/sprint-results', { score });
            setFinalResult({
                score,
                correctCount: (score / 10),
                incorrectCount: incorrectWords.length,
                newHighScore: response.data.newHighScore,
            });
            setGamePhase('results');
        } catch (error) {
            console.error("Failed to save sprint results:", error);
            alert("Could not save your score. Please check your connection.");
            router.back();
        }
    };


    const handlePlayAgain = () => {

        setScore(0);
        setStreak(0);
        setTimeLeft(SPRINT_DURATION);
        setCurrentIndex(0);
        setIncorrectWords([]);
        setFinalResult(null);
        setCountdown(3);
        setQuestions(shuffleArray(questions));
        setGamePhase('countdown');
    };



    if (gamePhase === 'loading') {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#8B5CF6" /></View>;
    }

    if (gamePhase === 'countdown') {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.countdownText}>{countdown}</Text>
            </View>
        );
    }

    if (gamePhase === 'results') {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.resultTitle}>Time's Up!</Text>
                {finalResult?.newHighScore && <Text style={styles.newHighScore}>🎉 NEW HIGH SCORE! 🎉</Text>}
                <Text style={styles.resultScore}>Your Score: {finalResult?.score.toLocaleString()}</Text>
                <Text style={styles.resultStats}>Correct: {finalResult?.correctCount} | Incorrect: {finalResult?.incorrectCount}</Text>



                <TouchableOpacity style={styles.actionButton} onPress={handlePlayAgain}>
                    <Text style={styles.actionButtonText}>Play Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>Back to Hub</Text>
                </TouchableOpacity>
            </View>
        );
    }


    const currentQuestion = questions[currentIndex];
    return (
        <View style={styles.gameContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.statBox}><Ionicons name="alarm" size={20} color="#fff" /><Text style={styles.headerText}>{timeLeft}</Text></View>
                <View style={styles.statBox}><Ionicons name="trophy" size={20} color="#fff" /><Text style={styles.headerText}>{score}</Text></View>
                <View style={styles.statBox}><Ionicons name="flame" size={20} color="#fff" /><Text style={styles.headerText}>x{streak}</Text></View>
            </View>

            {/* Question */}
            <View style={styles.questionContainer}>
                <Text style={styles.promptText}>{currentQuestion.promptText}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                    const isSelected = feedback?.selected === option.text;
                    const isCorrect = feedback?.correct;

                    let buttonStyle = styles.optionButton;
                    if (isSelected) {
                        buttonStyle = isCorrect ? styles.correctOption : styles.incorrectOption;
                    } else if (feedback && option.isCorrect) {
                        buttonStyle = styles.correctOption;
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            style={buttonStyle}
                            onPress={() => handleAnswerSelect(option)}
                            disabled={!!feedback}
                        >
                            <Text style={styles.optionText}>{option.text}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F0EAFD' },
    gameContainer: { flex: 1, backgroundColor: '#F0EAFD', paddingTop: 60, paddingHorizontal: 20 },
    countdownText: { fontSize: 96, fontWeight: 'bold', color: '#8B5CF6' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139, 92, 246, 0.8)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
    questionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    promptText: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
    optionsContainer: { paddingBottom: 40 },
    optionButton: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: '#E5E7EB' },
    optionText: { fontSize: 18, fontWeight: '500', textAlign: 'center', color: '#374151' },
    correctOption: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
    incorrectOption: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
    resultTitle: { fontSize: 48, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
    newHighScore: { fontSize: 20, color: '#F59E0B', fontWeight: 'bold', marginBottom: 20 },
    resultScore: { fontSize: 28, color: '#374151', marginBottom: 8 },
    resultStats: { fontSize: 18, color: '#6B7280', marginBottom: 40 },
    actionButton: { backgroundColor: '#8B5CF6', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginBottom: 20 },
    actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    backLink: { fontSize: 16, color: '#6B7280', textDecorationLine: 'underline' },
});

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);