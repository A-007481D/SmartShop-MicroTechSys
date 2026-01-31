import { useEffect, useState } from 'react';
import { getProducts } from '../../api/productApi';
import type { Product, Page } from '../../api/productApi';
import Button from '../../components/ui/Button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductCatalog() {
    const [productsPage, setProductsPage] = useState<Page<Product> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    const fetchProducts = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await getProducts(pageNum, 12);
            setProductsPage(data);
        } catch (err) {
            console.error("Failed to load products", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !productsPage) return <div className="p-8">Loading catalog...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Product Catalog</h1>
                <Button variant="outline" className="w-auto flex items-center gap-2" onClick={() => navigate('/client/profile')}>
                    Back to Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productsPage?.content.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-gray-400">No Image</span>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                <Button className="w-auto p-2" variant="primary">
                                    <ShoppingCart size={20} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 mt-8">
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
    );
}
