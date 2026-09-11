import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/common/Spinner';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { analyticsApi } from '../api';
import { formatCurrency, formatMonth, CHART_COLORS } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const CustomTooltip = ({ active, payload, label, currency = 'INR' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="capitalize">{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value, currency)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { user } = useAuth();
  const [trend12, setTrend12]       = useState([]);
  const [breakdown, setBreakdown]   = useState([]);
  const [incomeBreak, setIncomeBreak] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [month, setMonth]           = useState(format(new Date(), 'yyyy-MM'));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, b, ib] = await Promise.all([
        analyticsApi.getMonthlyTrend(6),
        analyticsApi.getCategoryBreakdown(month),
        analyticsApi.getCategoryBreakdown(month).then(() =>
          analyticsApi.getCategoryBreakdown(month)
        ),
      ]);
      // Fetch expense + income breakdowns separately
      const [expRes, incRes] = await Promise.all([
        analyticsApi.getCategoryBreakdown(month),
        fetch(`/api/analytics/category-breakdown?month=${month}&type=income`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then((r) => r.json()),
      ]);

      setTrend12(t.data.data.map((d) => ({ ...d, month: formatMonth(d.month + '-01') })));
      setBreakdown(expRes.data.data);
      setIncomeBreak(incRes.data || []);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [month]);

  const totalExpense = breakdown.reduce((s, d) => s + d.amount, 0);
  const totalIncome  = incomeBreak.reduce((s, d) => s + d.amount, 0);

  return (
    <PageWrapper
      title="Analytics"
      subtitle="Deep dive into your financial patterns and trends"
      actions={
        <input type="month" value={month} max={format(new Date(), 'yyyy-MM')}
          onChange={(e) => setMonth(e.target.value)} className="input-field text-sm w-40" />
      }
    >
      {loading ? <Spinner center /> : (
        <div className="space-y-6">

          {/* 12-Month Line Chart */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">6-Month Income vs Expense</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend12} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="income" name="Income"
                  stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="expense" name="Expense"
                  stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="savings" name="Savings"
                  stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryPieChart data={breakdown} />

            {/* Income sources */}
            <div className="card">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Income Sources</h3>
              {incomeBreak.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No income recorded this month</p>
              ) : (
                <div className="space-y-3">
                  {incomeBreak.map((d, i) => (
                    <div key={d.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{d.category}</span>
                        <span className="text-gray-500">{formatCurrency(d.amount, user?.currency)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.percentage}%`,
                            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Horizontal bar — top expense categories */}
          {breakdown.length > 0 && (
            <div className="card">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Top Expense Categories</h3>
              <ResponsiveContainer width="100%" height={breakdown.slice(0, 8).length * 48 + 20}>
                <BarChart
                  data={breakdown.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 60, left: 90, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val, user?.currency), 'Amount']}
                    contentStyle={{ borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {breakdown.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InsightCard
              title="Biggest Expense"
              value={breakdown[0]?.category || '—'}
              sub={breakdown[0] ? formatCurrency(breakdown[0].amount, user?.currency) : 'No expenses'}
              color="red"
            />
            <InsightCard
              title="Top Income Source"
              value={incomeBreak[0]?.category || '—'}
              sub={incomeBreak[0] ? formatCurrency(incomeBreak[0].amount, user?.currency) : 'No income'}
              color="green"
            />
            <InsightCard
              title="Expense Categories"
              value={`${breakdown.length} active`}
              sub={`Total: ${formatCurrency(totalExpense, user?.currency)}`}
              color="blue"
            />
          </div>

        </div>
      )}
    </PageWrapper>
  );
}

function InsightCard({ title, value, sub, color }) {
  const colors = {
    red:   'bg-red-50 border-red-100 text-red-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    blue:  'bg-blue-50 border-blue-100 text-blue-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wider">{title}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}
