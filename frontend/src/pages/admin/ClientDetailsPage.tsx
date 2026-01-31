import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDetails } from '../../api/adminApi';
import type { Client } from '../../api/adminApi';
import StatCard from '../../components/dashboard/StatCard';
import { ArrowLeft, User, ShoppingBag, DollarSign, Award } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ClientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchClient(Number(id));
    }, [id]);

    const fetchClient = async (clientId: number) => {
        setLoading(true);
        try {
            const data = await getClientDetails(clientId);
            setClient(data);
        } catch (err) {
            setError("Failed to load client details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error || !client) return <div className="p-8 text-red-600">{error || "Client not found"}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/admin/clients')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{client.fullName}</h1>
                    <p className="text-sm text-gray-500">Client ID: #{client.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Spent"
                    value={`$${client.turnover.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                    trend="+12%" // Mock trend
                    trendUp={true}
                />
                <StatCard
                    title="Total Orders"
                    value={client.totalOrders.toString()}
                    icon={ShoppingBag}
                    color="blue"
                />
                <StatCard
                    title="Loyalty Tier"
                    value={client.tier}
                    icon={Award}
                    color="purple"
                />
                {/* Placeholder for now */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className={`text-2xl font-bold ${client.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <User size={20} className="mr-2" />
                        Profile Information
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
                    <div className="mt-6">
                        <Button className="w-full" variant="outline">Edit Profile</Button>
                    </div>
                </div>

                {/* Recent Orders Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <ShoppingBag size={20} className="mr-2" />
                        Recent Orders
                    </h2>
                    <p className="text-gray-500 italic">Order history list will be implemented here.</p>
                </div>
            </div>
        </div>
    );
}
