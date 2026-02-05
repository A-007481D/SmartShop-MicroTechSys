import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Activity, DollarSign, ShoppingCart, Users, Download, Plus } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { getDashboardStats, type DashboardStats } from '../../api/adminApi';


export default function AdminDashboard() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {user?.username || 'Admin'}</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                        New Order
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={stats ? formatCurrency(stats.totalRevenue) : "..."}
                    icon={DollarSign}
                    trend="+12%"
                    trendUp={true}
                />
                <StatCard
                    title="Total Orders"
                    value={stats ? stats.totalOrders.toString() : "..."}
                    icon={ShoppingCart}
                    trend="+5%"
                    trendUp={true}
                />
                <StatCard
                    title="Active Clients"
                    value={stats ? stats.activeClients.toString() : "..."}
                    icon={Users}
                    trend="+2"
                    trendUp={true}
                />
                <StatCard
                    title="Avg. Order Value"
                    value={stats ? formatCurrency(stats.avgOrderValue) : "..."}
                    icon={Activity}
                    trend="-1%"
                    trendUp={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Placeholder for Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
                    <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                        Chart / Table
                    </div>
                </div>

                {/* Placeholder for Client Growth */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Products</h2>
                    <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                        Chart / list
                    </div>
                </div>
            </div>
        </div>
    );
}
