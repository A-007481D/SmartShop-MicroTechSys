import api from './axios';

export const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const logout = async () => {
    await api.post('/auth/logout');
};

export const getProfile = async () => {
    // Try to get client profile. If it fails (e.g. 403 because user is Admin), handle gracefully or try admin endpoint.
    // However, for simplicity and based on standard JWT/Session patterns, we usually have a generic /me.
    // Given the constraints and previous context, I'll assume /clients/me for CLIENT role.
    // But since we don't know the role yet, this is tricky. 
    // Let's assume the backend might have a generic user endpoint or we try one.
    // Actually, looking at the backend code previously, there was ClientController with /me.
    // If I am an admin, I might need /admin/me or similar.
    // For now, I'll stick to what I saw: /clients/me. If that fails during testing, I'll adjust.
    try {
        const response = await api.get('/clients/me');
        return { ...response.data, role: 'CLIENT' };
    } catch (error: any) {
        // If 403, maybe it's an admin?
        // This suggests we need a better "whoami" endpoint on the backend or we infer from the login response.
        // For this step, I will rely on the login response to set the user initially, 
        // and this getProfile might just be a "refresh" or detail fetcher.
        // Let's implement it as best effort.
        console.warn("Failed to fetch client profile", error);
        throw error;
    }
};
