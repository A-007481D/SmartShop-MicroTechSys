import axios from './axios';

export type PaymentType = 'CASH' | 'CHECK' | 'BANK';

export interface Payment {
    id: number;
    amount: number;
    paymentType: PaymentType;
    reference?: string;
    paymentDate: string;
    clearingDate?: string;
    bankName?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface AddPaymentRequest {
    amount: number;
    paymentType: PaymentType;
    reference?: string;
    paymentDate?: string;
    clearingDate?: string;
    bankName?: string;
}

export const getOrderPayments = async (orderId: number): Promise<Payment[]> => {
    const response = await axios.get<Payment[]>(`/v1/orders/${orderId}/payments`);
    return response.data;
};

export const addPayment = async (orderId: number, payment: AddPaymentRequest): Promise<Payment> => {
    const response = await axios.post<Payment>(`/v1/orders/${orderId}/payments`, payment);
    return response.data;
};

export const updatePaymentStatus = async (paymentId: number, status: string): Promise<Payment> => {
    const response = await axios.put<Payment>(`/v1/payments/${paymentId}/status`, null, {
        params: { status }
    });
    return response.data;
};
