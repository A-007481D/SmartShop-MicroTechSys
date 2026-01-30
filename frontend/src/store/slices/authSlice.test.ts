import authReducer, { loginUser, logout, checkAuth } from './authSlice';
import { configureStore } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';
import { vi } from 'vitest';

// Mock authApi
vi.mock('../../api/authApi');

describe('authSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
            }
        });
        vi.clearAllMocks();
    });

    it('should handle initial state', () => {
        expect(store.getState().auth).toEqual({
            isAuthenticated: false,
            user: null,
            status: 'idle',
            error: null,
        });
    });

    it('should handle loginUser.fulfilled', async () => {
        const mockUser = { username: 'testuser', role: 'CLIENT' };
        vi.mocked(authApi.login).mockResolvedValue(mockUser);

        await store.dispatch(loginUser({ username: 'testuser', password: 'password' }));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.status).toBe('succeeded');
    });

    it('should handle loginUser.rejected', async () => {
        const errorMessage = 'Invalid credentials';
        vi.mocked(authApi.login).mockRejectedValue({ response: { data: { message: errorMessage } } });

        await store.dispatch(loginUser({ username: 'testuser', password: 'wrong' }));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.status).toBe('failed');
        expect(state.error).toBe(errorMessage);
    });

    it('should handle logout', () => {
        store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: {
                auth: { isAuthenticated: true, user: { username: 'user', role: 'CLIENT' }, status: 'succeeded', error: null }
            }
        });

        store.dispatch(logout());
        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });
});
