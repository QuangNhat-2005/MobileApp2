import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 1. Cấu hình IP (Dùng IP trong ipconfig của bạn)
// Sau này đi làm, người ta sẽ để cái này trong file .env
const YOUR_IP_ADDRESS = '192.168.1.6'; 
const BACKEND_PORT = 5000;

const getBaseURL = () => {
    // Nếu chạy trên Web -> localhost
    if (Platform.OS === 'web') return `http://localhost:${BACKEND_PORT}`;
    // Nếu chạy trên Android Emulator -> 10.0.2.2 (Android quy định thế)
    // Nếu chạy trên điện thoại thật -> IP máy tính
    return `http://${YOUR_IP_ADDRESS}:${BACKEND_PORT}`;
};

const API_URL = getBaseURL();
console.log("🚀 API Client connected to:", API_URL);

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000, // Thêm timeout để không bị treo nếu mạng lag
});

// 2. Tự động gắn Token vào mọi request
apiClient.interceptors.request.use(async (config) => {
    try {
        let token;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('userToken');
        } else {
            token = await SecureStore.getItemAsync('userToken');
        }

        if (token) {
            config.headers['x-auth-token'] = token;
        }
    } catch (error) {
        console.error("Error getting token:", error);
    }
    return config;
}, (error) => Promise.reject(error));

// 3. Xử lý lỗi chung (Ví dụ: Hết hạn token thì tự logout)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Có thể xử lý logout tự động ở đây nếu muốn
            console.log("Token hết hạn hoặc không hợp lệ");
        }
        return Promise.reject(error);
    }
);

export default apiClient;