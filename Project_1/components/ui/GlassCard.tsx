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
        // Tăng độ đục lên một chút để nội dung dễ đọc hơn
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 24,
        padding: 25,
        alignItems: 'center',
        marginBottom: 20,

        // --- XỬ LÝ ĐỔ BÓNG VÀ VIỀN (FIX LỖI ANDROID) ---
        ...Platform.select({
            ios: {
                // iOS xử lý bóng đổ tốt với màu trong suốt -> Giữ nguyên
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            android: {
                // Android bị lỗi bóng đen khi nền trong suốt -> TẮT ELEVATION
                elevation: 0,
                // Thay vào đó, dùng viền trắng dày hơn một chút để tạo độ nổi
                borderWidth: 2,
                borderColor: '#FFFFFF',
            },
            web: {
                // Web
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