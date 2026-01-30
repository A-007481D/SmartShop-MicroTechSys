import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart } from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex flex-col w-64 bg-slate-900 min-h-screen text-white">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-wider">SmartShop</h1>
            </div>

            <div className="flex-1 flex flex-col pt-4 overflow-y-auto">
                <nav className="flex-1 px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 flex-shrink-0 h-5 w-5',
                                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 text-center">&copy; 2026 MicroTech</p>
            </div>
        </div>
    );
}
