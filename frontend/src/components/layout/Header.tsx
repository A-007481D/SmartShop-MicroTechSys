import { LogOut, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { logout as apiLogout } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("Logout api failed", error);
        } finally {
            dispatch(logout());
            navigate('/login');
        }
    };

    return (
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 sticky top-0">
            <h2 className="text-lg font-semibold text-gray-800">
                Welcome, {user?.username || 'Admin'}
            </h2>

            <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">
                        <User size={18} />
                    </div>
                    <span className="font-medium">{user?.role}</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
