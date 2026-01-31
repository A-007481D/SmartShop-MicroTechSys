import { useEffect, useState } from 'react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi';
import type { Product, Page } from '../../api/productApi';
import Button from '../../components/ui/Button';
import ProductForm from '../../components/products/ProductForm';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ProductsPage() {
    const [productsPage, setProductsPage] = useState<Page<Product> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    const fetchProducts = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await getAdminProducts(pageNum, 10);
            setProductsPage(data);
        } catch (err) {
            console.error("Failed to load products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProduct(undefined);
        setShowModal(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            fetchProducts(page);
        } catch (err) {
            console.error("Failed to delete product", err);
        }
    };

    const handleSubmit = async (data: any) => {
        setFormLoading(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, data);
            } else {
                await createProduct(data);
            }
            setShowModal(false);
            fetchProducts(page);
        } catch (err) {
            console.error("Failed to save product", err);
        } finally {
            setFormLoading(false);
        }
    };

    if (loading && !productsPage) return <div className="p-8">Loading products...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
                <Button onClick={handleCreate} className="w-auto flex items-center gap-2">
                    <Plus size={18} /> Add Product
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {productsPage?.content.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.stockQuantity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Simplified for brevity, reuse logic from ClientsPage if componentized) */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <Button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        variant="secondary"
                        className="w-auto"
                    >Previous</Button>
                    <span className="text-sm text-gray-700">Page {page + 1} of {productsPage?.totalPages || 1}</span>
                    <Button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= (productsPage?.totalPages || 1) - 1}
                        variant="secondary"
                        className="w-auto"
                    >Next</Button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                        <X size={20} />
                                    </button>
                                </div>
                                <ProductForm
                                    initialData={editingProduct}
                                    onSubmit={handleSubmit}
                                    isLoading={formLoading}
                                    onCancel={() => setShowModal(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
