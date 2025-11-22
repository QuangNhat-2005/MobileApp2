import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 24,
        padding: 25,
        alignItems: 'center',
        marginBottom: 20,


        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            android: {
                elevation: 0,
                borderWidth: 2,
                borderColor: '#FFFFFF',
            },
            web: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)',
            }
        })
    },
});