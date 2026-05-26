import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatMonth } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span style={{ color: p.color }} className="capitalize">{p.dataKey}</span>
          <span className="font-medium">₹{p.value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

export default function MonthlyTrendChart({ data }) {
  const formatted = data.map((d) => ({
    ...d,
    month: formatMonth(d.month + '-01'),
  }));

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income"  fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
          <Bar dataKey="savings" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Savings" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
