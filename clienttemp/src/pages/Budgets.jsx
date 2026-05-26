import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageWrapper from '../components/layout/PageWrapper';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { budgetApi } from '../api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const EXPENSE_CATS = [
  'Rent','Groceries','Food & Dining','Transportation','Utilities',
  'Healthcare','Entertainment','Shopping','Education','Travel',
  'Insurance','EMI / Loan','Subscriptions','Personal Care','Other Expense',
];

function BudgetCard({ budget, onDelete, currency }) {
  const pct = budget.percentUsed ?? Math.round((budget.spentAmount / budget.limitAmount) * 100);
  const over = pct >= 100;
  const warn = pct >= 80 && !over;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">{budget.category}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{budget.month}</p>
        </div>
        <div className="flex items-center gap-2">
          {over && <AlertTriangle size={16} className="text-red-500" />}
          {!over && pct >= 80 && <AlertTriangle size={16} className="text-amber-500" />}
          {pct < 80 && <CheckCircle size={16} className="text-green-400" />}
          <button onClick={() => onDelete(budget._id)}
            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Spent: <strong>{formatCurrency(budget.spentAmount, currency)}</strong></span>
          <span>Limit: <strong>{formatCurrency(budget.limitAmount, currency)}</strong></span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              over ? 'bg-red-500' : warn ? 'bg-amber-400' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={over ? 'text-red-500 font-medium' : 'text-gray-400'}>
            {over
              ? `Over by ${formatCurrency(budget.spentAmount - budget.limitAmount, currency)}`
              : `${formatCurrency(budget.remainingAmount ?? budget.limitAmount - budget.spentAmount, currency)} left`}
          </span>
          <span className={`font-semibold ${over ? 'text-red-500' : warn ? 'text-amber-500' : 'text-green-600'}`}>
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [form, setForm] = useState({ category: 'Groceries', limitAmount: '', month });
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getAll(month);
      setBudgets(res.data.data);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.limitAmount || parseFloat(form.limitAmount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await budgetApi.upsert({ ...form, month, limitAmount: parseFloat(form.limitAmount) });
      toast.success('Budget saved');
      setShowModal(false);
      fetchBudgets();
    } catch { toast.error('Failed to save budget'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetApi.remove(id);
      toast.success('Budget deleted');
      fetchBudgets();
    } catch { toast.error('Delete failed'); }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.limitAmount, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.spentAmount, 0);

  return (
    <PageWrapper
      title="Budgets"
      subtitle="Set spending limits per category and track your progress"
      actions={
        <div className="flex items-center gap-2">
          <input type="month" value={month} max={format(new Date(), 'yyyy-MM')}
            onChange={(e) => setMonth(e.target.value)} className="input-field text-sm w-40" />
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Budget
          </button>
        </div>
      }
    >
      {/* Summary bar */}
      {budgets.length > 0 && (
        <div className="card mb-6 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-gray-500">Total Budgeted</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(totalBudgeted, user?.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-lg font-bold text-red-500">{formatCurrency(totalSpent, user?.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Remaining</p>
            <p className={`text-lg font-bold ${totalBudgeted - totalSpent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(totalBudgeted - totalSpent, user?.currency)}
            </p>
          </div>
        </div>
      )}

      {loading ? <Spinner center /> : budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets set"
          description="Set spending limits for categories to stay on track"
          action={<button onClick={() => setShowModal(true)} className="btn-primary">Set First Budget</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard key={b._id} budget={b} onDelete={handleDelete} currency={user?.currency} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Set Budget">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              {EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit (₹)</label>
            <input type="number" min="1" className="input-field" placeholder="5000"
              value={form.limitAmount}
              onChange={(e) => setForm((p) => ({ ...p, limitAmount: e.target.value }))}
              required />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
