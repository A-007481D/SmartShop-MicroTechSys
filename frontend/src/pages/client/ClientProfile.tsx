import { useEffect, useState } from 'react';
import { getMyProfile } from '../../api/clientApi';
import type { Client } from '../../api/adminApi';
import StatCard from '../../components/dashboard/StatCard';
import { ShoppingBag, DollarSign, Award, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function ClientProfile() {
    const [profile, setProfile] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (loading) return <div className="p-8">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-red-600">Failed to load profile.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {profile.fullName}</p>
                </div>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut size={18} />
                    Sign Out
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="My Spending"
                    value={`$${profile.turnover.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="My Orders"
                    value={profile.totalOrders.toString()}
                    icon={ShoppingBag}
                    color="blue"
                />
                <StatCard
                    title="My Loyalty Tier"
                    value={profile.tier}
                    icon={Award}
                    color="purple"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                        <div className="mt-1 text-lg text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{profile.fullName}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email Address</label>
                        <div className="mt-1 text-lg text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{profile.email}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
                <div className="text-center py-10 text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No recent orders found.</p>
                    <Button className="mt-4" variant="primary">Browse Products</Button>
                </div>
            </div>
        </div>
    );
}
