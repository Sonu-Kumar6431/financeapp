import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM yyyy');
};

export const formatDateShort = (date) => format(new Date(date), 'dd MMM');
export const formatMonth = (date) => format(new Date(date), 'MMM yyyy');
export const formatMonthKey = (date) => format(new Date(date), 'yyyy-MM');
export const getRelativeTime = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const CATEGORY_COLORS = {
  'Salary':           '#10b981',
  'Freelance':        '#3b82f6',
  'Investment':       '#8b5cf6',
  'Business':         '#f59e0b',
  'Rent':             '#ef4444',
  'Groceries':        '#f97316',
  'Food & Dining':    '#eab308',
  'Transportation':   '#06b6d4',
  'Utilities':        '#64748b',
  'Healthcare':       '#ec4899',
  'Entertainment':    '#a855f7',
  'Shopping':         '#f43f5e',
  'Education':        '#0ea5e9',
  'Travel':           '#14b8a6',
  'Insurance':        '#6366f1',
  'EMI / Loan':       '#dc2626',
  'Subscriptions':    '#7c3aed',
  'Personal Care':    '#d97706',
  'Other Expense':    '#9ca3af',
  'Other Income':     '#34d399',
  'Gift':             '#fb7185',
};

export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1',
];

export const truncate = (str, n = 30) => str.length > n ? str.slice(0, n) + '…' : str;
