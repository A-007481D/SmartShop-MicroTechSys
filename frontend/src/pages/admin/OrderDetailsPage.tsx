import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails, updateOrderStatus } from '../../api/orderApi';
import type { Order } from '../../api/orderApi';
import { getOrderPayments, addPayment } from '../../api/paymentApi';
import type { Payment, AddPaymentRequest, PaymentType } from '../../api/paymentApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, User, Calendar, CreditCard, DollarSign, Plus } from 'lucide-react';

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState<AddPaymentRequest>({
        amount: 0,
        paymentType: 'CASH',
        reference: '',
        paymentDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!id) return;
        fetchData(Number(id));
    }, [id]);

    const fetchData = async (orderId: number) => {
        setLoading(true);
        try {
            const [orderData, paymentsData] = await Promise.all([
                getOrderDetails(orderId),
                getOrderPayments(orderId)
            ]);
            setOrder(orderData);
            setPayments(paymentsData);
        } catch (err) {
            console.error("Failed to load order", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async () => {
        if (!id || paymentForm.amount <= 0) return;
        try {
            await addPayment(Number(id), paymentForm);
            setShowAddPayment(false);
            setPaymentForm({ amount: 0, paymentType: 'CASH', reference: '', paymentDate: new Date().toISOString().split('T')[0] });
            fetchData(Number(id));
        } catch (err) {
            console.error("Failed to add payment", err);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!id) return;
        try {
            await updateOrderStatus(Number(id), newStatus);
            fetchData(Number(id));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const getTotalPaid = () => payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const getRemainingBalance = () => (order?.totalTTC || order?.totalAmount || 0) - getTotalPaid();

    if (loading) return <div className="p-8">Loading order details...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    const clientName = order.clientName || order.client?.fullName || 'Unknown';

    return (
        <div className="space-y-6">
            <Button variant="secondary" onClick={() => navigate('/admin/orders')} className="w-auto flex items-center gap-2">
                <ArrowLeft size={18} /> Back to Orders
            </Button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
                        <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.orderDate || order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full 
                            ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                            {order.status}
                        </span>
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <User size={18} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700 text-sm">Client</h3>
                        </div>
                        <p className="text-gray-900">{clientName}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={18} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700 text-sm">Date</h3>
                        </div>
                        <p className="text-gray-900">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={18} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700 text-sm">Total TTC</h3>
                        </div>
                        <p className="text-xl font-bold text-gray-900">${(order.totalTTC || order.totalAmount).toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={18} className="text-gray-500" />
                            <h3 className="font-semibold text-gray-700 text-sm">Remaining</h3>
                        </div>
                        <p className={`text-xl font-bold ${getRemainingBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${getRemainingBalance().toFixed(2)}
                        </p>
                    </div>
                </div>

                {order.subTotal && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                        <div><span className="text-sm text-gray-600">Subtotal HT:</span> <strong>${order.subTotal.toFixed(2)}</strong></div>
                        <div><span className="text-sm text-gray-600">Discount:</span> <strong className="text-green-600">-${(order.discountAmount || 0).toFixed(2)}</strong></div>
                        <div><span className="text-sm text-gray-600">TVA:</span> <strong>${(order.taxAmount || 0).toFixed(2)}</strong></div>
                        <div><span className="text-sm text-gray-600">Total TTC:</span> <strong>${(order.totalTTC || order.totalAmount).toFixed(2)}</strong></div>
                    </div>
                )}

                <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
                <div className="border rounded-lg overflow-hidden mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
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
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                                </tr>
                            )) || (
                                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No items</td></tr>
                                )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Payments</h2>
                    <Button variant="primary" onClick={() => setShowAddPayment(!showAddPayment)} className="w-auto flex items-center gap-2">
                        <Plus size={16} /> Add Payment
                    </Button>
                </div>

                {showAddPayment && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            label="Amount"
                            type="number"
                            value={paymentForm.amount || ''}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={paymentForm.paymentType}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value as PaymentType })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="CASH">Cash</option>
                                <option value="CHECK">Check</option>
                                <option value="BANK">Bank Transfer</option>
                            </select>
                        </div>
                        <Input
                            label="Reference"
                            value={paymentForm.reference || ''}
                            onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                        />
                        <div className="flex items-end">
                            <Button variant="primary" onClick={handleAddPayment} className="w-full">Save Payment</Button>
                        </div>
                    </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No payments recorded</td></tr>
                            ) : payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{payment.paymentType}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{payment.reference || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-900">Total Paid</td>
                                <td className="px-6 py-4 font-bold text-green-600">${getTotalPaid().toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
