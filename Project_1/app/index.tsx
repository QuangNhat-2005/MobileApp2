import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import apiClient from '../api/axiosConfig';
import styles from '../styles/AuthScreen.styles';

// --- 1. COMPONENT FIX LỖI BẤM 2 LẦN TRÊN WEB ---
const KeyboardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web') {
        return <View style={{ flex: 1 }}>{children}</View>;
    }
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>{children}</View>
        </TouchableWithoutFeedback>
    );
};

// --- 2. INPUT ĐƠN GIẢN (ĐÃ XÓA MÀU MÈ) ---
const StyledTextInput = (props: TextInputProps) => {
    return (
        <View style={styles.inputWrapper}>
            <TextInput
                style={[
                    styles.input,
                    // Tắt khung đen xấu xí trên Web
                    Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                ]}
                placeholderTextColor="#9ca3af"
                {...props}
            />
        </View>
    );
};

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    const containerOpacity = useSharedValue(0);
    const containerTranslateY = useSharedValue(30);

    useEffect(() => {
        containerOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
        containerTranslateY.value = withDelay(200, withTiming(0, { duration: 800 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
        transform: [{ translateY: containerTranslateY.value }],
    }));

    const handleAuthentication = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError('');

        try {
            let token;
            if (isLogin) {
                // --- LOGIN: Gửi Username thay vì Email ---
                const response = await apiClient.post('/api/auth/login', {
                    username: username, // Dùng biến username
                    password: password
                });
                token = response.data.token;
            } else {
                // --- REGISTER: Gửi cả Username và Email ---
                if (password !== confirmPassword) {
                    throw new Error("Mật khẩu xác nhận không khớp");
                }
                const response = await apiClient.post('/api/auth/register', {
                    username,
                    email,
                    password
                });
                token = response.data.token;
            }

            if (token) {
                if (Platform.OS === 'web') {
                    localStorage.setItem('userToken', token);
                } else {
                    await SecureStore.setItemAsync('userToken', token);
                }
                // Cập nhật header cho các request sau
                apiClient.defaults.headers.common['x-auth-token'] = token;
                router.replace('/(tabs)/home');
            }

        } catch (e: any) {
            const errorMessage = e.response?.data?.msg || e.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // --- FORM LOGIN (CHỈ CẦN USERNAME & PASS) ---
    const renderLoginForm = () => (
        <>
            <StyledTextInput
                placeholder="Username" // Đổi label thành Username
                value={username}       // Bind vào biến username
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <StyledTextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
        </>
    );

    // --- FORM SIGNUP (CẦN CẢ EMAIL ĐỂ ĐĂNG KÝ) ---
    const renderSignUpForm = () => (
        <>
            <StyledTextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <StyledTextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <StyledTextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <StyledTextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
        </>
    );

    return (
        <KeyboardWrapper>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.background} />

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Animated.View style={[styles.innerContainer, animatedStyle]}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="logo-react" size={28} color="#433890" />
                                <Text style={styles.logoText}>LingoQuest</Text>
                            </View>

                            <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Start Your Journey'}</Text>

                            {isLogin ? renderLoginForm() : renderSignUpForm()}

                            {error ? <Text style={localStyles.errorText}>{error}</Text> : null}

                            <TouchableOpacity style={styles.button} onPress={handleAuthentication} disabled={isLoading}>
                                {isLoading
                                    ? <ActivityIndicator color="#FFFFFF" />
                                    : <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Create Account'}</Text>
                                }
                            </TouchableOpacity>

                            {isLogin ? (
                                <View style={styles.bottomLinksContainer}>
                                    <TouchableOpacity onPress={() => setIsLogin(false)}>
                                        <Text style={styles.linkText}>Sign Up</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Text style={styles.linkText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setIsLogin(true)}>
                                    <Text style={styles.linkText}>Already have your account? Log In</Text>
                                </TouchableOpacity>
                            )}

                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </KeyboardWrapper>
    );
}

const localStyles = StyleSheet.create({
    errorText: {
        color: '#D32F2F',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        fontWeight: '500',
    }
});