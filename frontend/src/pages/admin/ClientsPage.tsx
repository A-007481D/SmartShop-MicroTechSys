import { useEffect, useState } from 'react';
import { getClients } from '../../api/adminApi';
import type { Client, Page } from '../../api/adminApi';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function ClientsPage() {
    const [clientsPage, setClientsPage] = useState<Page<Client> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchClients(page);
    }, [page]);

    const fetchClients = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await getClients(pageNum, 10);
            setClientsPage(data);
        } catch (err) {
            setError("Failed to load clients");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !clientsPage) return <div className="p-8">Loading clients...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Clients Management</h1>
                {/* Add filters later */}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clientsPage?.content.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {client.fullName.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{client.fullName}</div>
                                                <div className="text-sm text-gray-500">{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${client.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-800' :
                                                client.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                                                    client.tier === 'SILVER' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                            {client.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {client.totalOrders}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${client.turnover.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {client.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/clients/${client.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
                        <Button onClick={() => setPage(p => p + 1)} disabled={page >= (clientsPage?.totalPages || 1) - 1}>Next</Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{page * (clientsPage?.size || 10) + 1}</span> to <span className="font-medium">{Math.min((page + 1) * (clientsPage?.size || 10), clientsPage?.totalElements || 0)}</span> of <span className="font-medium">{clientsPage?.totalElements}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= (clientsPage?.totalPages || 1) - 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
