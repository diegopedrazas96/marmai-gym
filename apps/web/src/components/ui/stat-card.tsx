import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'indigo' | 'green' | 'yellow' | 'red';
  trend?: string;
}

const colorMap = {
  indigo: { bg: 'bg-primary-50', icon: 'bg-primary-100 text-primary-600', text: 'text-primary-600' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', text: 'text-yellow-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
};

export function StatCard({ label, value, icon: Icon, color = 'indigo', trend }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
