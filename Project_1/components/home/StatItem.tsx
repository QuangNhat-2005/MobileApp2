import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

interface StatItemProps {
    icon: 'star' | 'fire';
    value: string | number;
    label: string;
    color: string;
}

export const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => {
    return (
        <View style={styles.container}>
            {icon === 'star' ? (
                <FontAwesome5 name="star" size={18} color={color} />
            ) : (
                <MaterialCommunityIcons name="fire" size={20} color={color} />
            )}
            <Text style={styles.text}>{value} {label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center' },
    text: { marginLeft: 8, fontSize: 16, fontWeight: '500', color: '#374151' },
});