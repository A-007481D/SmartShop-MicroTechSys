import { useEffect, useState } from 'react';
import { getMyProfile, getMyOrders } from '../../api/clientApi';
import type { OrderSummary } from '../../api/clientApi';
import type { Client } from '../../api/adminApi';
import { ShoppingBag, LogOut, Star } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const TIER_CONFIG = {
    BASIC: { color: 'gray', discount: 0, next: 'SILVER', threshold: 1000 },
    SILVER: { color: 'slate', discount: 5, next: 'GOLD', threshold: 5000 },
    GOLD: { color: 'yellow', discount: 10, next: 'PLATINUM', threshold: 20000 },
    PLATINUM: { color: 'purple', discount: 15, next: null, threshold: null }
};

export default function ClientProfile() {
    const [profile, setProfile] = useState<Client | null>(null);
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, ordersData] = await Promise.all([
                    getMyProfile(),
                    getMyOrders()
                ]);
                setProfile(profileData);
                setOrders(ordersData);
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (loading) return <div className="p-8">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-red-600">Failed to load profile.</div>;

    const tierInfo = TIER_CONFIG[profile.tier];

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {profile.fullName}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-semibold
                        ${profile.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-800' :
                            profile.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                                profile.tier === 'SILVER' ? 'bg-gray-200 text-gray-800' :
                                    'bg-gray-100 text-gray-600'}`}>
                        <Star size={16} fill="currentColor" />
                        {profile.tier} • {tierInfo.discount}% Off
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                        <LogOut size={18} />
                        Sign Out
                    </Button>
                </div>
            </div>

            {tierInfo.next && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-800 font-medium">🎯 Progress to {tierInfo.next}</p>
                            <p className="text-xs text-purple-600">Spend ${((tierInfo.threshold || 0) - profile.turnover).toLocaleString()} more to unlock {TIER_CONFIG[tierInfo.next as keyof typeof TIER_CONFIG].discount}% discount!</p>
                        </div>
                        <div className="w-48 h-3 bg-purple-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all" style={{ width: `${Math.min((profile.turnover / (tierInfo.threshold || 1)) * 100, 100)}%` }} />
                        </div>
                    </div>
                </div>
            )}

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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
                {orders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No orders yet.</p>
                        <Button className="mt-4" variant="primary" onClick={() => navigate('/products')}>Browse Products</Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
