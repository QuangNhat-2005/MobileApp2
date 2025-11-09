import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, Stack, useRouter } from 'expo-router'; 
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSound } from '../hooks/useSound';


const SettingsRow = ({ icon, text, action }: { icon: any, text: string, action: () => void }) => (
    <TouchableOpacity style={styles.settingsRow} onPress={action}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name={icon} size={22} color={'#374151'} />
            <Text style={styles.settingsText}>{text}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
);


const TipRow = ({ icon, text }: { icon: any, text: string }) => (
    <View style={styles.tipRow}>
        <MaterialCommunityIcons name={icon} size={22} color="#34D399" style={styles.tipIcon} />
        <Text style={styles.tipText}>{text}</Text>
    </View>
);

export default function AccountSecurityScreen() {
    const router = useRouter();
    const playSound = useSound();

    const handlePress = (path: Href) => {
        playSound('click');
        router.push(path);
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Account Security</Text>
                    </View>

                    <Text style={styles.introText}>
                        Manage your password and keep your account secure.
                    </Text>

                    <View style={styles.glassCard}>
                        <SettingsRow
                            icon="shield-lock-outline"
                            text="Change Password"
                            action={() => handlePress('/changePassword')}
                        />
                    </View>

                    <View style={styles.glassCard}>
                        <Text style={styles.cardTitle}>Security Tips</Text>
                        <TipRow icon="check-decagram" text="Use a strong, unique password." />
                        <TipRow icon="check-decagram" text="Do not share your password with anyone." />
                        <TipRow icon="check-decagram" text="Log out from shared devices after use." />
                    </View>

                </ScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    introText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 20,
    },
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10
    },
    settingsText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 15
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    tipIcon: {
        marginRight: 15,
    },
    tipText: {
        fontSize: 15,
        color: '#4B5563',
        flex: 1,
    }
});