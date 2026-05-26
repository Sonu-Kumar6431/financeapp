import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Target, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import PageWrapper from '../components/layout/PageWrapper';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { goalApi } from '../api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const GOAL_ICONS = { 'Emergency Fund':'🛡️', Vacation:'✈️', Home:'🏠', Vehicle:'🚗', Education:'🎓', Retirement:'👴', General:'🎯' };

function GoalCard({ goal, onContribute, onDelete, currency }) {
  const pct = goal.progressPercent ?? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  const remaining = goal.remainingAmount ?? Math.max(0, goal.targetAmount - goal.savedAmount);
  const isCompleted = goal.status === 'completed';
  const isOverdue = !isCompleted && isPast(new Date(goal.deadline));

  return (
    <div className={`card hover:shadow-md transition-shadow ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{GOAL_ICONS[goal.category] || '🎯'}</span>
          <div>
            <h4 className="font-semibold text-gray-800">{goal.title}</h4>
            <p className="text-xs text-gray-400">{goal.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isCompleted && <CheckCircle size={16} className="text-green-500" />}
          {isOverdue && <Clock size={16} className="text-red-500" />}
          {!isCompleted && (
            <button onClick={() => onContribute(goal)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
              <PlusCircle size={15} />
            </button>
          )}
          <button onClick={() => onDelete(goal._id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Saved: <strong className="text-green-600">{formatCurrency(goal.savedAmount, currency)}</strong></span>
        <span>Target: <strong>{formatCurrency(goal.targetAmount, currency)}</strong></span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-gray-400">
          {isCompleted ? '🎉 Goal achieved!' : `${formatCurrency(remaining, currency)} to go`}
        </span>
        <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-primary-600'}`}>{pct}%</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Deadline: {formatDate(goal.deadline)}</span>
        {isOverdue && !isCompleted && <span className="text-red-500 font-medium">Overdue</span>}
      </div>
    </div>
  );
}

const emptyForm = {
  title: '', targetAmount: '', savedAmount: '',
  deadline: format(new Date(Date.now() + 90 * 864e5), 'yyyy-MM-dd'),
  category: 'General', description: '', icon: '🎯',
};

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contribGoal, setContribGoal] = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [contribAmt, setContribAmt] = useState('');
  const [saving, setSaving]     = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalApi.getAll();
      setGoals(res.data.data);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalApi.create({ ...form, targetAmount: parseFloat(form.targetAmount), savedAmount: parseFloat(form.savedAmount || 0) });
      toast.success('Goal created!');
      setShowForm(false);
      setForm(emptyForm);
      fetchGoals();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create goal'); }
    finally { setSaving(false); }
  };

  const handleContribute = async () => {
    if (!contribAmt || parseFloat(contribAmt) <= 0) return toast.error('Enter a valid amount');
    try {
      await goalApi.contribute(contribGoal._id, parseFloat(contribAmt));
      toast.success('Contribution added!');
      setContribGoal(null);
      setContribAmt('');
      fetchGoals();
    } catch { toast.error('Failed to add contribution'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await goalApi.remove(id); toast.success('Goal deleted'); fetchGoals(); }
    catch { toast.error('Delete failed'); }
  };

  const active    = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <PageWrapper
      title="Financial Goals"
      subtitle="Set targets and track your savings progress"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Goal
        </button>
      }
    >
      {loading ? <Spinner center /> : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set your first savings goal — emergency fund, vacation, or anything you're working towards"
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Create First Goal</button>}
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Active Goals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((g) => (
                  <GoalCard key={g._id} goal={g} onContribute={(g) => setContribGoal(g)} onDelete={handleDelete} currency={user?.currency} />
                ))}
              </div>
            </section>
          )}
          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Completed 🎉</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {completed.map((g) => (
                  <GoalCard key={g._id} goal={g} onContribute={() => {}} onDelete={handleDelete} currency={user?.currency} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Goal" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Goal Title</label>
              <input type="text" className="input-field" placeholder="e.g. Emergency Fund"
                value={form.title} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div>
              <label className="label">Target Amount (₹)</label>
              <input type="number" min="1" className="input-field" placeholder="100000"
                value={form.targetAmount} onChange={(e) => set('targetAmount', e.target.value)} required />
            </div>
            <div>
              <label className="label">Already Saved (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="0"
                value={form.savedAmount} onChange={(e) => set('savedAmount', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {Object.keys(GOAL_ICONS).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Target Deadline</label>
              <input type="date" className="input-field" value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)} required />
            </div>
            <div className="col-span-2">
              <label className="label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea className="input-field resize-none" rows={2} placeholder="Why is this goal important?"
                value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Creating…' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal isOpen={!!contribGoal} onClose={() => setContribGoal(null)} title={`Add Savings — ${contribGoal?.title}`}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Current saved:</span>
              <strong>{formatCurrency(contribGoal?.savedAmount || 0, user?.currency)}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Still needed:</span>
              <strong className="text-primary-600">
                {formatCurrency((contribGoal?.targetAmount || 0) - (contribGoal?.savedAmount || 0), user?.currency)}
              </strong>
            </div>
          </div>
          <div>
            <label className="label">Amount to Add (₹)</label>
            <input type="number" min="1" className="input-field" placeholder="1000"
              value={contribAmt} onChange={(e) => setContribAmt(e.target.value)} autoFocus />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setContribGoal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleContribute} className="btn-primary flex-1">Add Savings</button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
