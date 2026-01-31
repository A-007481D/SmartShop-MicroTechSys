import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDetails } from '../../api/adminApi';
import type { Client } from '../../api/adminApi';
import axios from '../../api/axios';
import StatCard from '../../components/dashboard/StatCard';
import { ArrowLeft, User, ShoppingBag, DollarSign, Award, Star, Eye } from 'lucide-react';

interface OrderSummary {
    id: number;
    totalAmount: number;
    status: string;
    orderDate: string;
}

const TIER_CONFIG = {
    BASIC: { color: 'gray', discount: 0, next: 'SILVER', threshold: 1000 },
    SILVER: { color: 'slate', discount: 5, next: 'GOLD', threshold: 5000 },
    GOLD: { color: 'yellow', discount: 10, next: 'PLATINUM', threshold: 20000 },
    PLATINUM: { color: 'purple', discount: 15, next: null, threshold: null }
};

export default function ClientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchData(Number(id));
    }, [id]);

    const fetchData = async (clientId: number) => {
        setLoading(true);
        try {
            const [clientData, ordersData] = await Promise.all([
                getClientDetails(clientId),
                axios.get<OrderSummary[]>(`/v1/orders/client/${clientId}`).then(r => r.data).catch(() => [])
            ]);
            setClient(clientData);
            setOrders(ordersData);
        } catch (err) {
            setError("Failed to load client details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error || !client) return <div className="p-8 text-red-600">{error || "Client not found"}</div>;

    const tierInfo = TIER_CONFIG[client.tier];

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/admin/clients')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">{client.fullName}</h1>
                    <p className="text-sm text-gray-500">Client ID: #{client.id}</p>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-semibold
                    ${client.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-800' :
                        client.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                            client.tier === 'SILVER' ? 'bg-gray-200 text-gray-800' :
                                'bg-gray-100 text-gray-600'}`}>
                    <Star size={16} fill="currentColor" />
                    {client.tier} • {tierInfo.discount}% Discount
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Spent" value={`$${client.turnover.toLocaleString()}`} icon={DollarSign} color="green" />
                <StatCard title="Total Orders" value={client.totalOrders.toString()} icon={ShoppingBag} color="blue" />
                <StatCard title="Loyalty Tier" value={client.tier} icon={Award} color="purple" />
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className={`text-2xl font-bold ${client.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </div>

            {tierInfo.next && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-800 font-medium">Progress to {tierInfo.next}</p>
                            <p className="text-xs text-purple-600">${client.turnover.toLocaleString()} / ${tierInfo.threshold?.toLocaleString()}</p>
                        </div>
                        <div className="w-48 h-2 bg-purple-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-600 rounded-full"
                                style={{ width: `${Math.min((client.turnover / (tierInfo.threshold || 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <User size={20} className="mr-2" /> Profile Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Full Name</label>
                            <div className="mt-1 text-gray-900">{client.fullName}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email Address</label>
                            <div className="mt-1 text-gray-900">{client.email}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Joined Date</label>
                            <div className="mt-1 text-gray-900">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <ShoppingBag size={20} className="mr-2" /> Recent Orders
                    </h2>
                    {orders.length === 0 ? (
                        <p className="text-gray-500 italic">No orders found for this client.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.slice(0, 5).map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                    ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => navigate(`/admin/orders/${order.id}`)} className="text-gray-500 hover:text-gray-700">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
