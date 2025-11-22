import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, LayoutAnimation } from 'react-native';
import apiClient from '../api/axiosConfig';
import { CustomAlert } from '../components/ui/CustomAlert';
import { useSound } from '../hooks/useSound';

export default function ChangePasswordScreen() {
    // --- QUẢN LÝ TRẠNG THÁI FORM (STATE MANAGEMENT) ---
    // Lưu trữ giá trị các ô input
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Trạng thái loading khi đang gọi API
    const [isLoading, setIsLoading] = useState(false);

    // Biến tính toán độ mạnh mật khẩu (0: Chưa nhập, 1: Yếu, 2: Trung bình, 3: Mạnh)
    const [strengthLevel, setStrengthLevel] = useState(0);

    const router = useRouter();
    const playSound = useSound();

    // --- CẤU HÌNH CUSTOM ALERT ---
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

    // Hàm tiện ích để hiển thị popup thông báo
    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setAlertConfig({ title, message, type });
        setAlertVisible(true);
    };

    // --- LOGIC ĐÁNH GIÁ ĐỘ MẠNH MẬT KHẨU ---
    // Hàm này chạy mỗi khi người dùng thay đổi mật khẩu mới
    useEffect(() => {
        if (newPassword.length === 0) {
            setStrengthLevel(0);
        } else if (newPassword.length < 6) {
            setStrengthLevel(1); // Yếu (Đỏ)
        } else if (newPassword.length < 9) {
            setStrengthLevel(2); // Trung bình (Vàng)
        } else {
            setStrengthLevel(3); // Mạnh (Xanh)
        }
    }, [newPassword]);

    // Lấy màu sắc và chiều rộng thanh progress dựa trên độ mạnh
    const getStrengthColor = () => {
        switch (strengthLevel) {
            case 1: return '#EF4444'; // Đỏ
            case 2: return '#F59E0B'; // Vàng cam
            case 3: return '#10B981'; // Xanh lá
            default: return '#E5E7EB'; // Xám
        }
    };

    const getStrengthWidth = () => {
        switch (strengthLevel) {
            case 1: return '33%';
            case 2: return '66%';
            case 3: return '100%';
            default: return '0%';
        }
    };

    // --- XỬ LÝ GỬI FORM (SUBMIT HANDLER) ---
    const handleChangePassword = async () => {
        playSound('click');

        // 1. Kiểm tra điền đủ thông tin
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert('Thiếu thông tin', 'Vui lòng điền đầy đủ tất cả các trường.', 'error');
            return;
        }

        // 2. Kiểm tra độ dài tối thiểu
        if (newPassword.length < 6) {
            showAlert('Mật khẩu yếu', 'Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
            return;
        }

        // 3. Kiểm tra mật khẩu xác nhận có khớp không
        if (newPassword !== confirmPassword) {
            showAlert('Sai mật khẩu', 'Mật khẩu xác nhận không khớp.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // 4. Gọi API đổi mật khẩu
            await apiClient.post('/api/auth/change-password', {
                currentPassword,
                newPassword
            });
            
            // 5. Thành công -> Reset form và báo cho người dùng
            showAlert('Thành công', 'Mật khẩu của bạn đã được cập nhật!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error: any) {
            // 6. Xử lý lỗi từ Server trả về (VD: Sai mật khẩu cũ)
            const msg = error.response?.data?.msg || 'Đã có lỗi xảy ra.';
            showAlert('Thất bại', msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#fde6f3', '#e4eefd', '#f0eaff']} style={styles.container}>
            {/* Component thông báo tùy chỉnh (Popup) */}
            <CustomAlert 
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => {
                    setAlertVisible(false);
                    if (alertConfig.type === 'success') {
                        router.back(); // Quay lại trang trước nếu đổi thành công
                    }
                }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    {/* Tiêu đề màn hình */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Change Password</Text>
                    </View>

                    <View style={styles.formCard}>
                        
                        {/* Ô nhập mật khẩu hiện tại */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter current password"
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Ô nhập mật khẩu mới */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password (min 6 chars)"
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholderTextColor="#9CA3AF"
                            />
                            
                            {/* Thanh hiển thị độ mạnh mật khẩu */}
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBarBackground}>
                                    <View 
                                        style={[
                                            styles.strengthBarFill, 
                                            { 
                                                width: getStrengthWidth(), 
                                                backgroundColor: getStrengthColor() 
                                            }
                                        ]} 
                                    />
                                </View>
                                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                                    {strengthLevel === 0 ? '' : strengthLevel === 1 ? 'Weak' : strengthLevel === 2 ? 'Medium' : 'Strong'}
                                </Text>
                            </View>
                        </View>

                        {/* Ô xác nhận mật khẩu mới */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter new password"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Nút xác nhận đổi mật khẩu */}
                        <TouchableOpacity 
                            style={styles.submitButton} 
                            onPress={handleChangePassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Update Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
    
    header: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1F2937' },

    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 24,
        padding: 25,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#fff',
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 8, marginLeft: 4 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    

    strengthContainer: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    strengthBarBackground: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginRight: 10, overflow: 'hidden' },
    strengthBarFill: { height: '100%', borderRadius: 3 },
    strengthText: { fontSize: 12, fontWeight: 'bold', width: 50, textAlign: 'right' },

    submitButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});