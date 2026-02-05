import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../api/orderApi';
import type { CreateOrderRequest } from '../../api/orderApi';
import { getClients } from '../../api/adminApi';
import type { Client } from '../../api/adminApi';
import { getAdminProducts } from '../../api/productApi';
import type { Product } from '../../api/productApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

interface CartItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
}

export default function CreateOrderPage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [clientsData, productsData] = await Promise.all([
                getClients(),
                getAdminProducts()
            ]);
            setClients(clientsData.content || []);
            setProducts(productsData.content || []);
        } catch (err) {
            console.error('Failed to load data', err);
        }
    };

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1
            }]);
        }
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        ));
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleSubmit = async () => {
        if (!selectedClientId || cart.length === 0) {
            setError('Please select a client and add items');
            return;
        }

        setLoading(true);
        setError(null);

        const request: CreateOrderRequest = {
            clientId: Number(selectedClientId),
            items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
            promoCode: promoCode || undefined
        };

        try {
            await createOrder(request);
            navigate('/admin/orders');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={() => navigate('/admin/orders')} className="w-auto">
                    <ArrowLeft size={18} />
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">Create New Order</h1>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Select Client</h2>
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select Client --</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.fullName} ({client.email})
                            </option>
                        ))}
                    </select>

                    <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4">Add Products</h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {products.map(product => (
                            <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">{product.name}</p>
                                    <p className="text-sm text-gray-500">${product.price.toFixed(2)} - Stock: {product.stockQuantity}</p>
                                </div>
                                <Button variant="primary" onClick={() => addToCart(product)} className="w-auto">
                                    <Plus size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

                    {cart.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No items in cart</p>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{item.productName}</p>
                                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                        />
                                        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <Input
                            label="Promo Code (Optional)"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="PROMO-XXXX"
                        />
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Subtotal:</span>
                            <span>${getSubtotal().toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Final total calculated by server</p>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={loading}
                        className="w-full mt-6"
                        disabled={!selectedClientId || cart.length === 0}
                    >
                        Create Order
                    </Button>
                </div>
            </div>
        </div>
    );
}
