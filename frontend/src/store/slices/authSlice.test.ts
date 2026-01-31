import authReducer, { loginUser, logout } from './authSlice';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';

// Mock authApi
vi.mock('../../api/authApi', () => ({
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn()
}));

describe('authSlice', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer as any,
            }
        });
        vi.clearAllMocks();
        // Mock loginUser thunk to return fulfilled action
        (loginUser as any).mockReturnValue(() => {
            return Promise.resolve({
                type: 'auth/loginUser/fulfilled',
                payload: { username: 'testuser', role: 'CLIENT' },
                meta: { requestStatus: 'fulfilled' }
            });
        });
        // Mock fulfilled property for matchers
        (loginUser as any).fulfilled = {
            match: (action: any) => action.type === 'auth/loginUser/fulfilled'
        };
    });

    it('should handle initial state', () => {
        expect(store.getState().auth).toEqual({
            isAuthenticated: false,
            user: null,
            status: 'idle',
            error: null,
        });
    });

    it('should handle loginUser.pending', () => {
        const action = { type: loginUser.pending.type };
        const state = authReducer(undefined, action);
        expect(state.status).toEqual('loading');
        expect(state.error).toBeNull();
    });

    it('should handle loginUser.fulfilled', () => {
        const user = { username: 'testuser', role: 'CLIENT' };
        const action = { type: loginUser.fulfilled.type, payload: user };
        const state = authReducer(undefined, action);
        expect(state.status).toEqual('succeeded');
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(user);
    });

    it('should handle loginUser.rejected', () => {
        const action = { type: loginUser.rejected.type, payload: 'Login failed' };
        const state = authReducer(undefined, action);
        expect(state.status).toEqual('failed');
        expect(state.error).toEqual('Login failed');
    });

    it('should handle logout', () => {
        store = configureStore({
            reducer: { auth: authReducer as any },
            preloadedState: {
                auth: {
                    isAuthenticated: true,
                    user: { username: 'testuser', role: 'CLIENT' as const }, // Fix: Cast role as const or match enum
                    status: 'succeeded',
                    error: null,
                }
            }
        });
        store.dispatch(logout());
        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });
});
