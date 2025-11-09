
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';



const YOUR_COMPUTER_IP_ADDRESS = '172.29.193.40';
const BACKEND_PORT = 5000; 
const getBaseURL = () => {
    if (Platform.OS === 'web') {
       
        return `http://localhost:${BACKEND_PORT}`;
    } else {
        return `http://${YOUR_COMPUTER_IP_ADDRESS}:${BACKEND_PORT}`;
    }
};

const API_URL = getBaseURL();

console.log("API client is connecting to:", API_URL); 

const apiClient = axios.create({
    baseURL: API_URL,
});


apiClient.interceptors.request.use(async (config) => {
    let token;

    try {
        if (Platform.OS === 'web') {
            token = localStorage.getItem('userToken');
        } else {
            token = await SecureStore.getItemAsync('userToken');
        }

        if (token) {
            config.headers['x-auth-token'] = token;
        }
    } catch (e) {
        console.error("Lỗi khi xử lý token:", e);
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;