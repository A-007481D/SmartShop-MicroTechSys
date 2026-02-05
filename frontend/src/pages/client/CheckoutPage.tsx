import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CreditCard, Banknote, Building } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCartItems, selectCartTotal, clearCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../api/orderApi';
import { addPayment, type AddPaymentRequest } from '../../api/paymentApi';
import { getMyProfile } from '../../api/clientApi';
import Button from '../../components/ui/Button';

type PaymentMethod = 'CASH' | 'CHECK' | 'BANK';

interface CheckoutFormInputs {
    paymentMethod: PaymentMethod;
    promoCode: string;
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CheckoutFormInputs>({
        defaultValues: {
            paymentMethod: 'CASH',
            promoCode: ''
        }
    });

    const [error, setError] = useState<string | null>(null);
    const paymentMethod = watch('paymentMethod');

    if (cartItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Button onClick={() => navigate('/products')} className="w-auto">Browse Products</Button>
            </div>
        );
    }

    const onSubmit = async (data: CheckoutFormInputs) => {
        setError(null);
        try {
            const profile = await getMyProfile();

            const orderRequest = {
                clientId: profile.id,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                promoCode: data.promoCode || undefined
            };

            const order = await createOrder(orderRequest);

            const paymentRequest: AddPaymentRequest = {
                amount: total,
                paymentType: data.paymentMethod,
                reference: `Checkout-${Date.now()}`,
                paymentDate: new Date().toISOString().split('T')[0]
            };

            await addPayment(order.id, paymentRequest);

            dispatch(clearCart());
            navigate('/client/profile');

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Checkout failed. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <Button variant="secondary" onClick={() => navigate('/products')} className="w-auto flex items-center gap-2">
                <ArrowLeft size={18} /> Back to Catalog
            </Button>

            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.productId} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <div className="pt-4 border-t flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setValue('paymentMethod', 'CASH')}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors
                                    ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Banknote size={24} />
                                <span className="text-sm font-medium">Cash</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('paymentMethod', 'CHECK')}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors
                                    ${paymentMethod === 'CHECK' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <CreditCard size={24} />
                                <span className="text-sm font-medium">Check</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('paymentMethod', 'BANK')}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors
                                    ${paymentMethod === 'BANK' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Building size={24} />
                                <span className="text-sm font-medium">Bank</span>
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code (Optional)</label>
                            <input
                                {...register('promoCode')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter code"
                            />
                        </div>

                        <div className="mt-8">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3 text-lg"
                                isLoading={isSubmitting}
                            >
                                Place Order (${total.toFixed(2)})
                            </Button>
                            <p className="text-xs text-gray-400 text-center mt-2">
                                By placing this order, you agree to our terms.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
