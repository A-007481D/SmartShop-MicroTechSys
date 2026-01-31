import axios from './axios';

export interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    clientName: string;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    items?: OrderItem[];
}

export const getAdminOrders = async (): Promise<Order[]> => {
    const response = await axios.get<Order[]>('/v1/orders');
    return response.data;
};

export const getOrderDetails = async (id: number): Promise<Order> => {
    const response = await axios.get<Order>(`/v1/orders/${id}`);
    return response.data;
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
    const response = await axios.put<Order>(`/v1/orders/${id}/status`, null, {
        params: { status }
    });
    return response.data;
};

export const deleteOrder = async (id: number): Promise<void> => {
    await axios.delete(`/v1/orders/${id}`);
};
