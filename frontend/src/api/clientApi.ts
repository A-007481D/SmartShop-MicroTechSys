import api from './axios';
import type { Client } from './adminApi'; // Reuse Client interface or define new if different view
// Start with reuse for simplicity 

export interface OrderSummary {
    id: number;
    totalAmount: number;
    status: string;
    itemsCount: number;
    createdAt: string;
}

export const getMyProfile = async (): Promise<Client> => {
    const response = await api.get<Client>('/clients/me');
    return response.data;
};

export const getMyOrders = async (): Promise<OrderSummary[]> => {
    const response = await api.get<OrderSummary[]>('/clients/me/orders');
    return response.data;
};
