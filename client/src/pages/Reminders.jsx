import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import PageWrapper from '../components/layout/PageWrapper';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { reminderApi } from '../api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const REMINDER_CATS = ['Bill', 'Rent', 'EMI', 'Subscription', 'Insurance', 'Tax', 'Other'];

const emptyForm = {
  title: '',
  amount: '',
  dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
  category: 'Bill',
  isRecurring: false,
  recurringInterval: 'monthly',
};

function ReminderCard({ reminder, onPay, onDelete, currency }) {
  const due = new Date(reminder.dueDate);
  const overdue  = isPast(due) && !reminder.isPaid;
  const dueSoon  = !reminder.isPaid && isWithinInterval(due, { start: new Date(), end: addDays(new Date(), 3) });

  const statusColor = reminder.isPaid
    ? 'border-green-200 bg-green-50/40'
    : overdue ? 'border-red-200 bg-red-50/30'
    : dueSoon ? 'border-amber-200 bg-amber-50/30'
    : 'border-gray-100';

  const StatusIcon = reminder.isPaid
    ? CheckCircle
    : overdue ? AlertCircle
    : dueSoon ? Clock
    : Bell;

  const iconColor = reminder.isPaid ? 'text-green-500'
    : overdue ? 'text-red-500'
    : dueSoon ? 'text-amber-500'
    : 'text-gray-400';

  return (
    <div className={`card border ${statusColor} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${reminder.isPaid ? 'bg-green-100' : overdue ? 'bg-red-100' : dueSoon ? 'bg-amber-100' : 'bg-gray-100'}`}>
            <StatusIcon size={18} className={iconColor} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{reminder.title}</h4>
            <p className="text-xs text-gray-400">{reminder.category}{reminder.isRecurring ? ` · ${reminder.recurringInterval}` : ''}</p>
          </div>
        </div>
        <button onClick={() => onDelete(reminder._id)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          {reminder.amount > 0 && (
            <p className="text-xl font-bold text-gray-800">{formatCurrency(reminder.amount, currency)}</p>
          )}
          <p className={`text-xs mt-0.5 font-medium ${overdue ? 'text-red-500' : dueSoon ? 'text-amber-600' : 'text-gray-400'}`}>
            {reminder.isPaid ? '✓ Paid' : overdue ? `Overdue since ${formatDate(reminder.dueDate)}` : `Due ${formatDate(reminder.dueDate)}`}
          </p>
        </div>

        {!reminder.isPaid && (
          <button onClick={() => onPay(reminder._id)}
            className="btn-primary text-xs px-3 py-1.5">
            Mark Paid
          </button>
        )}
      </div>
    </div>
  );
}

export default function Reminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await reminderApi.getAll();
      setReminders(res.data.data);
    } catch { toast.error('Failed to load reminders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReminders(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reminderApi.create({
        ...form,
        amount: parseFloat(form.amount || 0),
        recurringInterval: form.isRecurring ? form.recurringInterval : null,
      });
      toast.success('Reminder set!');
      setShowForm(false);
      setForm(emptyForm);
      fetchReminders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handlePay = async (id) => {
    try {
      await reminderApi.markPaid(id);
      toast.success('Marked as paid!');
      fetchReminders();
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try { await reminderApi.remove(id); toast.success('Deleted'); fetchReminders(); }
    catch { toast.error('Delete failed'); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const unpaid   = reminders.filter((r) => !r.isPaid);
  const paid     = reminders.filter((r) => r.isPaid);
  const overdue  = unpaid.filter((r) => isPast(new Date(r.dueDate)));
  const upcoming = unpaid.filter((r) => !isPast(new Date(r.dueDate)));

  return (
    <PageWrapper
      title="Bill Reminders"
      subtitle="Track upcoming bills, EMIs and recurring payments"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Reminder
        </button>
      }
    >
      {loading ? <Spinner center /> : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders yet"
          description="Set up bill reminders so you never miss a payment"
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Add First Reminder</button>}
        />
      ) : (
        <div className="space-y-8">
          {overdue.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} /> Overdue ({overdue.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {overdue.map((r) => <ReminderCard key={r._id} reminder={r} onPay={handlePay} onDelete={handleDelete} currency={user?.currency} />)}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map((r) => <ReminderCard key={r._id} reminder={r} onPay={handlePay} onDelete={handleDelete} currency={user?.currency} />)}
              </div>
            </section>
          )}

          {paid.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle size={14} /> Paid ({paid.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paid.map((r) => <ReminderCard key={r._id} reminder={r} onPay={handlePay} onDelete={handleDelete} currency={user?.currency} />)}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Bill Reminder">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input type="text" className="input-field" placeholder="e.g. Electricity Bill"
              value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹) <span className="text-gray-400 font-normal">optional</span></label>
              <input type="number" min="0" className="input-field" placeholder="0"
                value={form.amount} onChange={(e) => set('amount', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {REMINDER_CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input-field" value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)} required />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="rec" checked={form.isRecurring}
              onChange={(e) => set('isRecurring', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="rec" className="text-sm text-gray-700">Recurring</label>
            {form.isRecurring && (
              <select className="input-field ml-auto w-32 text-xs" value={form.recurringInterval}
                onChange={(e) => set('recurringInterval', e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Set Reminder'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
