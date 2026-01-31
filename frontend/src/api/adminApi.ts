import axios from './axios';

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    activeClients: number;
    avgOrderValue: number;
}

export interface Client {
    id: number;
    fullName: string;
    email: string;
    tier: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM';
    turnover: number;
    totalOrders: number;
    isActive: boolean;
    createdAt?: string;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>('/admin/dashboard-stats');
    return response.data;
};

export const getClients = async (page = 0, size = 10): Promise<Page<Client>> => {
    const response = await axios.get<Page<Client>>('/admin/clients', {
        params: { page, size }
    });
    return response.data;
};

export const getClientDetails = async (id: number): Promise<Client> => {
    const response = await axios.get<Client>(`/admin/clients/${id}`);
    return response.data;
};
