import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  icon?: ReactNode;
  value: string | number;
  label: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

export function StatsCard({ icon, value, label, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500', 
    orange: 'text-orange-500',
    purple: 'text-purple-500'
  };

  return (
    <div className="text-center">
      {icon && <div className="mb-2">{icon}</div>}
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">
        {label}
      </div>
    </div>
  );
}