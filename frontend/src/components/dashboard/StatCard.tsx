import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'blue' }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-lg", colorMap[color])}>
                    <Icon size={24} />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn("font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                        {trend}
                    </span>
                    <span className="text-gray-400 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
}
