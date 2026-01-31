import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../../api/orderApi';
import type { Order } from '../../api/orderApi';
import Button from '../../components/ui/Button';
import { ArrowLeft, User, Calendar, CreditCard } from 'lucide-react';

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchOrder(Number(id));
    }, [id]);

    const fetchOrder = async (orderId: number) => {
        setLoading(true);
        try {
            const data = await getOrderDetails(orderId);
            setOrder(data);
        } catch (err) {
            console.error("Failed to load order", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading order details...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    return (
        <div className="space-y-6">
            <Button variant="secondary" onClick={() => navigate('/admin/orders')} className="w-auto flex items-center gap-2">
                <ArrowLeft size={18} /> Back to Orders
            </Button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
                        <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full 
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'}`}>
                        {order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <User size={20} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700">Client</h3>
                        </div>
                        <p className="text-gray-900">{order.clientName}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar size={20} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700">Timeline</h3>
                        </div>
                        <p className="text-gray-900">Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <CreditCard size={20} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700">Total</h3>
                        </div>
                        <p className="text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {order.items?.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">${item.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </td>
                                </tr>
                            )) || (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No items available</td>
                                    </tr>
                                )}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-900">Total Amount</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
