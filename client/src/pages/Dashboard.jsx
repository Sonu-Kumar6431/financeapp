import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Percent, Plus, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/common/StatCard';
import Spinner from '../components/common/Spinner';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TransactionForm from '../components/transactions/TransactionForm';
import { analyticsApi } from '../api';
import { formatDate, formatCurrency, CATEGORY_COLORS } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary]     = useState(null);
  const [trend, setTrend]         = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [month, setMonth]         = useState(format(new Date(), 'yyyy-MM'));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, t, b, r] = await Promise.all([
        analyticsApi.getSummary(month),
        analyticsApi.getMonthlyTrend(6),
        analyticsApi.getCategoryBreakdown(month),
        analyticsApi.getRecent(),
      ]);
      setSummary(s.data.data);
      setTrend(t.data.data);
      setBreakdown(b.data.data);
      setRecent(r.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [month]);

  const currentMonthLabel = format(new Date(month + '-01'), 'MMMM yyyy');

  return (
    <PageWrapper
      title={`Good ${getGreeting()}, ${user?.name?.split(' ')[0]} 👋`}
      subtitle={`Here's your financial snapshot for ${currentMonthLabel}`}
      actions={
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            max={format(new Date(), 'yyyy-MM')}
            onChange={(e) => setMonth(e.target.value)}
            className="input-field text-sm w-40"
          />
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      }
    >
      {loading ? <Spinner center /> : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Income"
              amount={summary?.income || 0}
              currency={user?.currency}
              icon={TrendingUp}
              color="green"
              subtitle={currentMonthLabel}
            />
            <StatCard
              title="Total Expenses"
              amount={summary?.expense || 0}
              currency={user?.currency}
              icon={TrendingDown}
              color="red"
              subtitle={currentMonthLabel}
            />
            <StatCard
              title="Net Savings"
              amount={summary?.savings || 0}
              currency={user?.currency}
              icon={PiggyBank}
              color={summary?.savings >= 0 ? 'purple' : 'red'}
              subtitle={currentMonthLabel}
            />
            <div className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Savings Rate</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">{summary?.savingsRate || 0}%</p>
                  <p className="text-xs text-gray-400 mt-0.5">{currentMonthLabel}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                  <Percent size={20} />
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, summary?.savingsRate || 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MonthlyTrendChart data={trend} />
            </div>
            <CategoryPieChart data={breakdown} />
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Recent Transactions</h3>
              <Link to="/transactions" className="text-sm text-primary-600 hover:underline">
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No transactions yet.{' '}
                <button onClick={() => setShowForm(true)} className="text-primary-600 hover:underline">
                  Add your first one
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map((t) => (
                  <div key={t._id} className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#9ca3af' }}
                      >
                        {t.category[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.category}</p>
                        <p className="text-xs text-gray-400">{formatDate(t.date)}{t.description ? ` · ${t.description}` : ''}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchAll}
      />
    </PageWrapper>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
