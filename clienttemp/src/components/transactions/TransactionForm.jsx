import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { transactionApi } from '../../api';

const INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income'];
const EXPENSE_CATS = [
  'Rent', 'Groceries', 'Food & Dining', 'Transportation', 'Utilities',
  'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Travel',
  'Insurance', 'EMI / Loan', 'Subscriptions', 'Personal Care', 'Other Expense',
];

const emptyForm = {
  type: 'expense',
  amount: '',
  category: 'Food & Dining',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  tags: '',
  isRecurring: false,
  recurringInterval: null,
};

export default function TransactionForm({ isOpen, onClose, onSuccess, transaction }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const isEdit = !!transaction;

  useEffect(() => {
    if (transaction) {
      setForm({
        type:              transaction.type,
        amount:            transaction.amount,
        category:          transaction.category,
        description:       transaction.description,
        date:              format(new Date(transaction.date), 'yyyy-MM-dd'),
        tags:              transaction.tags?.join(', ') || '',
        isRecurring:       transaction.isRecurring,
        recurringInterval: transaction.recurringInterval,
      });
    } else {
      setForm(emptyForm);
    }
  }, [transaction, isOpen]);

  const categories = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      return toast.error('Enter a valid amount');
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        recurringInterval: form.isRecurring ? form.recurringInterval : null,
      };

      if (isEdit) {
        await transactionApi.update(transaction._id, payload);
        toast.success('Transaction updated');
      } else {
        await transactionApi.create(payload);
        toast.success('Transaction added');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                set('type', t);
                set('category', t === 'income' ? 'Salary' : 'Food & Dining');
              }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                form.type === t
                  ? t === 'income' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount (₹)</label>
          <input
            type="number" step="0.01" min="0"
            className="input-field" placeholder="0.00"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Date + Description */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date" className="input-field"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text" className="input-field"
              placeholder="Optional note"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
          <input
            type="text" className="input-field"
            placeholder="e.g. groceries, family"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
          />
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="recurring" checked={form.isRecurring}
            onChange={(e) => set('isRecurring', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="recurring" className="text-sm text-gray-700">Recurring transaction</label>
          {form.isRecurring && (
            <select
              className="input-field ml-auto w-32 text-xs"
              value={form.recurringInterval || ''}
              onChange={(e) => set('recurringInterval', e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
