import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, amount, currency = 'INR', icon: Icon, color, trend, subtitle }) {
  const colorMap = {
    green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',  text: 'text-green-600' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',      text: 'text-red-600' },
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',    text: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${c.text}`}>{formatted}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${c.icon}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
          {trend > 0 ? <TrendingUp size={12} className="text-green-500" /> :
           trend < 0 ? <TrendingDown size={12} className="text-red-500" /> :
           <Minus size={12} />}
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  );
}
