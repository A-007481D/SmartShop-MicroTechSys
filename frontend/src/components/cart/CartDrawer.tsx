import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    removeFromCart,
    updateQuantity,
    toggleCart,
    selectCartItems,
    selectCartTotal,
    selectIsCartOpen
} from '../../store/slices/cartSlice';
import Button from '../ui/Button';

export default function CartDrawer() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const cartItems = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);
    const isOpen = useAppSelector(selectIsCartOpen);

    if (!isOpen) return null;

    const handleCheckout = () => {
        dispatch(toggleCart());
        navigate('/client/checkout');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => dispatch(toggleCart())}
            />

            <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                <div className="h-full w-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Shopping Cart
                        </h2>
                        <button
                            onClick={() => dispatch(toggleCart())}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                                <ShoppingBag size={48} className="opacity-20" />
                                <p>Your cart is empty</p>
                                <Button
                                    variant="outline"
                                    onClick={() => dispatch(toggleCart())}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.productId} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-3 bg-white border rounded px-2 py-1">
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                                                    disabled={item.quantity <= 1}
                                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => dispatch(removeFromCart(item.productId))}
                                                className="text-red-500 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full py-3"
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
