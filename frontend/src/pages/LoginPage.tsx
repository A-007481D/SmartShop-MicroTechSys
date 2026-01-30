import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../store/hooks';
import { loginUser } from '../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useState } from 'react';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [localError, setLocalError] = useState<string | null>(null);

    const from = location.state?.from?.pathname || '/';

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormInputs) => {
        setLocalError(null);
        try {
            const resultAction = await dispatch(loginUser(data));

            if (loginUser.fulfilled.match(resultAction)) {
                const user = resultAction.payload;
                const role = (user as any).role || 'CLIENT';

                if (from === '/' || from === '/login') {
                    if (role === 'ADMIN') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/client/profile');
                    }
                } else {
                    navigate(from, { replace: true });
                }
            } else {
                if (resultAction.payload) {
                    setLocalError(resultAction.payload as string);
                } else {
                    setLocalError(resultAction.error.message || 'Login failed');
                }
            }
        } catch (err: any) {
            setLocalError('An unexpected error occurred.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">SmartShop Login</h1>
                    <p className="text-blue-100 text-sm mt-1">Manage your management efficiently</p>
                </div>

                <div className="p-8">
                    {localError && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                            {localError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            label="Username"
                            type="text"
                            {...register('username')}
                            error={errors.username?.message}
                            placeholder="Enter your username"
                        />

                        <Input
                            label="Password"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                            placeholder="Enter your password"
                        />

                        <Button type="submit" isLoading={isSubmitting}>
                            Sign In
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
