import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';

interface User {
    username: string;
    role: 'ADMIN' | 'CLIENT';
    id?: number;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    status: 'idle',
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: any, { rejectWithValue }) => {
        try {
            const data = await authApi.login(credentials);
            
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
           
            const user = await authApi.getProfile();
            return user;
        } catch (err: any) {
            return rejectWithValue('Session invalid');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.status = 'idle';
            state.error = null;
            authApi.logout();
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthenticated = true;
                
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
