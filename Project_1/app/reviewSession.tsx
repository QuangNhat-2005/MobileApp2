import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../api/axiosConfig';
import { useSound } from '../hooks/useSound';
interface Word { _id: string; text: string; meaning: string; example?: string; }
interface Option { text: string; isCorrect: boolean; }
interface Question {
    wordId: string;
    questionType: 'meaning_to_word' | 'word_to_meaning';
    promptText: string;
    options: Option[];
    correctAnswer: string;
}
type SessionPhase = 'loading' | 'quizzing' | 'complete' | 'no_words';
const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

export default function ReviewSessionScreen() {
    const router = useRouter();
    const playSound = useSound();
    const abortControllerRef = useRef(new AbortController());

    const [phase, setPhase] = useState<SessionPhase>('loading');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [completionMessage, setCompletionMessage] = useState("Review Complete!");

    useEffect(() => {
        const controller = abortControllerRef.current;
        const fetchSessionData = async () => {
            try {
                const response = await apiClient.get(`/api/review/session`, {
                    signal: controller.signal
                });
                const sessionData = response.data;
                if (sessionData && sessionData.reviewWords?.length > 0) {
                    startQuiz(sessionData.reviewWords);
                } else {
                    setCompletionMessage(sessionData.message || "You have no words to review!");
                    setPhase('no_words');
                }
            } catch (error: any) {
                if (error.name === 'CanceledError') return;
                console.error("Lỗi khi lấy dữ liệu ôn tập:", error);
                alert("Không thể tải buổi ôn tập. Vui lòng thử lại.");
                router.back();
            }
        };
        fetchSessionData();
        return () => controller.abort();
    }, []);

    const handleAnswerSelect = async (option: Option) => {
        if (selectedAnswer) return;
        if (option.isCorrect) playSound('correct'); else playSound('incorrect');
        setSelectedAnswer(option.text);
        setIsCorrect(option.isCorrect);
        try {
            await apiClient.post('/api/words/answer', {
                wordId: questions[currentQuestionIndex].wordId,
                isCorrect: option.isCorrect,
            }, { signal: abortControllerRef.current.signal });
        } catch (error: any) {
            if (error.name !== 'CanceledError') console.error("Lỗi khi gửi câu trả lời:", error);
        }
    };

    const startQuiz = (reviewWords: Word[]) => {
        if (reviewWords.length > 0) {
            generateQuestions(reviewWords);
            setPhase('quizzing');
        } else {
            setPhase('complete');
        }
    };

    const generateQuestions = (words: Word[]) => {
        const allWords = shuffleArray(words);
        const generatedQuestions = allWords.map((correctWord) => {
            const distractors = shuffleArray(allWords.filter(w => w._id !== correctWord._id)).slice(0, 3);
            const questionType: Question['questionType'] = Math.random() > 0.5 ? 'meaning_to_word' : 'word_to_meaning';
            if (questionType === 'meaning_to_word') {
                const options = shuffleArray([{ text: correctWord.text, isCorrect: true }, ...distractors.map(d => ({ text: d.text, isCorrect: false }))]);
                return { wordId: correctWord._id, questionType, promptText: correctWord.meaning, options, correctAnswer: correctWord.text };
            } else {
                const options = shuffleArray([{ text: correctWord.meaning, isCorrect: true }, ...distractors.map(d => ({ text: d.meaning, isCorrect: false }))]);
                return { wordId: correctWord._id, questionType, promptText: correctWord.text, options, correctAnswer: correctWord.meaning };
            }
        });
        setQuestions(generatedQuestions);
    };

    const handleContinueQuiz = () => {
        playSound('click');
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            playSound('complete');
            setPhase('complete');
        }
    };

    const getOptionStyle = (option: Option) => {
        if (!selectedAnswer) return styles.optionButton;
        const isSelected = selectedAnswer === option.text;
        if (option.isCorrect) return [styles.optionButton, styles.correctOption];
        if (isSelected && !option.isCorrect) return [styles.optionButton, styles.incorrectOption];
        return [styles.optionButton, styles.disabledOption];
    };

    if (phase === 'loading') {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#8B5CF6" /></View>;
    }

    if (phase === 'complete' || phase === 'no_words') {
        return (
            <View style={styles.centered}>
                <Text style={styles.completeTitle}>{completionMessage}</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => { playSound('click'); router.back(); }}>
                    <Text style={styles.primaryButtonText}>Awesome!</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (phase === 'quizzing' && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#6B7280" /></TouchableOpacity>
                    <View style={styles.progressBarContainer}><View style={[styles.progressBar, { width: `${progress}%` }]} /></View>
                </View>
                <View style={styles.content}>
                    <View style={styles.promptContainer}>
                        <Text style={styles.promptHelperText}>{currentQuestion.questionType === 'meaning_to_word' ? 'Which word means:' : 'What is the meaning of:'}</Text>
                        <Text style={styles.promptWord}>{currentQuestion.promptText}</Text>
                    </View>
                    <View>
                        {currentQuestion.options.map((option, index) => (
                            <TouchableOpacity key={index} style={getOptionStyle(option)} onPress={() => handleAnswerSelect(option)} disabled={!!selectedAnswer}>
                                <Text style={styles.optionText}>{option.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                {selectedAnswer && (
                    <View style={[styles.footer, isCorrect ? styles.footerCorrect : styles.footerIncorrect]}>
                        <View>
                            <Text style={styles.footerResultText}>{isCorrect ? 'Correct!' : 'Incorrect!'}</Text>
                            {!isCorrect && <Text style={styles.footerAnswerText}>Answer: {currentQuestion.correctAnswer}</Text>}
                        </View>
                        <TouchableOpacity style={styles.continueButton} onPress={handleContinueQuiz}><Text style={styles.continueButtonText}>Continue</Text></TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    return <View style={styles.centered}><Text>Loading Review...</Text></View>;
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F9FAFB' },
    container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    progressBarContainer: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginLeft: 15 },
    progressBar: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 4 },
    content: { flex: 1, justifyContent: 'space-between', padding: 20 },
    promptContainer: { flex: 0.8, justifyContent: 'center', alignItems: 'center' },
    promptHelperText: { fontSize: 18, color: '#6B7280', marginBottom: 10 },
    promptWord: { fontSize: 36, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
    optionButton: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: '#E5E7EB' },
    optionText: { fontSize: 18, fontWeight: '500', textAlign: 'center', color: '#374151' },
    correctOption: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
    incorrectOption: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
    disabledOption: { opacity: 0.6 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerCorrect: { backgroundColor: '#10B981' },
    footerIncorrect: { backgroundColor: '#EF4444' },
    footerResultText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    footerAnswerText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, marginTop: 4 },
    continueButton: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    continueButtonText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    completeTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    primaryButton: { backgroundColor: '#8B5CF6', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});