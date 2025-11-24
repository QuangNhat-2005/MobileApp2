import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';


const PRODUCTION_URL = 'https://lingoquest-api.onrender.com';


const getBaseURL = () => {

    return PRODUCTION_URL;
};

const API_URL = getBaseURL();
console.log("🚀 API Client connected to:", API_URL);

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

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

export default apiClient;