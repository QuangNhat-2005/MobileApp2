import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import apiClient from '../api/axiosConfig';


export interface DashboardStats {
    username: string;
    level: number;
    streak: number;
    dailyGoalProgress: number;
    dailyGoalTotal: number;
    avatarUrl: string;
}

export const useDashboardData = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchData = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (error: any) {
            console.error("Error fetching dashboard:", error);
            if (error.response?.status === 401) {
                router.replace('/'); 
            }
        } finally {
            setIsLoading(false);
        }
    }, [router]);


    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    return { stats, isLoading, refetch: fetchData };
};