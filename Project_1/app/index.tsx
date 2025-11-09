import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import styles from './styles/AuthScreen.styles';
import apiClient from '../api/axiosConfig';
type StyledTextInputProps = {
    isFocused: boolean;
} & TextInputProps;

const StyledTextInput = ({ isFocused, ...props }: StyledTextInputProps) => {
    const textInput = (
        <TextInput
            style={styles.input}
            placeholderTextColor="#9ca3af"
            {...props}
        />
    );
    if (isFocused) {
        return (
            <LinearGradient
                colors={['#F59E0B', '#F472B6', '#A78BFA', '#60A5FA']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.inputWrapperFocused}
            >{textInput}</LinearGradient>
        );
    }
    return <View style={styles.inputWrapper}>{textInput}</View>;
};

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
                const response = await apiClient.post('/api/auth/login', { email, password });
                token = response.data.token;
            } else {
                const response = await apiClient.post('/api/auth/register', { username, email, password });
                token = response.data.token;
            }
            if (token) {
                if (Platform.OS === 'web') {
                    localStorage.setItem('userToken', token);
                } else {
                    await SecureStore.setItemAsync('userToken', token);
                }
                router.replace('/(tabs)/home');
            }

        } catch (e: any) {
            const errorMessage = e.response?.data?.msg || e.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderLoginForm = () => (
        <>
            <StyledTextInput
                placeholder="Email" value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
                onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'email'}
            />
            <StyledTextInput
                placeholder="Password" value={password} onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'password'}
            />
        </>
    );

    const renderSignUpForm = () => (
        <>
            <StyledTextInput
                placeholder="Username" value={username} onChangeText={setUsername}
                onFocus={() => setFocusedInput('username')} onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'username'}
            />
            <StyledTextInput
                placeholder="Email" value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
                onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'email'}
            />
            <StyledTextInput
                placeholder="Password" value={password} onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'password'}
            />
            <StyledTextInput
                placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('confirmPassword')} onBlur={() => setFocusedInput(null)}
                isFocused={focusedInput === 'confirmPassword'}
            />
        </>
    );

    return (
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
                                <TouchableOpacity onPress={() => setIsLogin(false)}><Text style={styles.linkText}>Sign Up</Text></TouchableOpacity>
                                <TouchableOpacity><Text style={styles.linkText}>Forgot Password?</Text></TouchableOpacity>
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