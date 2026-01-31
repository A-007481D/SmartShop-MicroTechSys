import api from './axios';
import type { Client } from './adminApi';

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

export const getMyOrderDetails = async (id: number): Promise<any> => {
    const response = await api.get<any>(`/clients/me/orders/${id}`);
    return response.data;
};
