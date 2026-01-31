import axios from './axios';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    sku: string;
    imageUrl?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

// Admin Endpoints

export const getAdminProducts = async (page = 0, size = 10): Promise<Page<Product>> => {
    const response = await axios.get<Page<Product>>('/v1/admin/products', {
        params: { page, size }
    });
    return response.data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'isActive' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await axios.post<Product>('/v1/admin/products', product);
    return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await axios.put<Product>(`/v1/admin/products/${id}`, product);
    return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await axios.delete(`/v1/admin/products/${id}`);
};

// Client Endpoints

export const getProducts = async (page = 0, size = 10): Promise<Page<Product>> => {
    // Client sees /api/v1/products (active only)
    const response = await axios.get<Page<Product>>('/v1/products', {
        params: { page, size }
    });
    return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
    const response = await axios.get<Product>(`/v1/products/${id}`);
    return response.data;
};
