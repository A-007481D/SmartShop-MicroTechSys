import axios from './axios';

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    activeClients: number;
    avgOrderValue: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>('/admin/dashboard-stats');
    return response.data;
};
