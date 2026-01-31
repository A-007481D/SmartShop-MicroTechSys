import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser } from '../store/slices/authSlice';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../store/slices/authSlice', async () => {
    const actual = await vi.importActual('../store/slices/authSlice');
    return {
        ...actual,
        loginUser: vi.fn(),
    };
});

const renderWithProviders = (
    ui: React.ReactElement,
    { preloadedState = {}, store = configureStore({ reducer: { auth: authReducer }, preloadedState }) } = {}
) => {
    return {
        ...render(
            <Provider store={store}>
                <BrowserRouter>
                    {ui}
                </BrowserRouter>
            </Provider>
        ),
        store,
    };
};

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    
        (loginUser as any).mockReturnValue(() => {
            return Promise.resolve({
                type: 'auth/loginUser/fulfilled',
                payload: { username: 'testuser', role: 'CLIENT' },
                meta: { requestStatus: 'fulfilled' }
            });
        });
        (loginUser as any).fulfilled = {
            match: (action: any) => action.type === 'auth/loginUser/fulfilled'
        };
    });

    it('renders login form', () => {
        renderWithProviders(<LoginPage />);
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('submits form with credentials', async () => {
        const { } = renderWithProviders(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(loginUser).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
        });
    });

    it('displays error on failed login', async () => {
        // Mock failure
        (loginUser as any).mockReturnValue(() => {
            return Promise.resolve({
                type: 'auth/loginUser/rejected',
                payload: 'Invalid credentials',
                error: { message: 'Failed' },
                meta: { requestStatus: 'rejected' }
            });
        });

        renderWithProviders(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
