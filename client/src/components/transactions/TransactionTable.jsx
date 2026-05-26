import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Pencil, Trash2, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionApi } from '../../api';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../../utils/formatters';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';

export default function TransactionTable({ onEdit, onImport, refreshKey }) {
  const [data, setData]           = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ type: '', category: '', search: '', sortBy: 'date', sortOrder: 'desc' });
  const [page, setPage]           = useState(1);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getAll({ ...filters, page, limit: 15 });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, page, refreshKey]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionApi.remove(id);
      toast.success('Deleted');
      fetchTransactions();
    } catch { toast.error('Delete failed'); }
  };

  const handleExport = async () => {
    try {
      const res = await transactionApi.exportCSV({ type: filters.type });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'transactions.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch { toast.error('Export failed'); }
  };

  const setFilter = (key, val) => { setFilters((p) => ({ ...p, [key]: val })); setPage(1); };

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search transactions…"
            className="input-field pl-9 text-sm"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        {/* Filters */}
        <select className="input-field w-32 text-sm" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select className="input-field w-36 text-sm" value={filters.sortBy} onChange={(e) => setFilter('sortBy', e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="category">Sort by Category</option>
        </select>

        <button onClick={() => setFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="btn-secondary text-sm px-3 py-2">
          {filters.sortOrder === 'desc' ? '↓' : '↑'}
        </button>

        {/* Actions */}
        <button onClick={onImport} className="btn-secondary text-sm flex items-center gap-1.5">
          <Upload size={14} /> Import
        </button>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-1.5">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Table */}
      {loading ? <Spinner center /> : data.length === 0 ? (
        <EmptyState icon={Filter} title="No transactions found" description="Try adjusting your filters" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#9ca3af' }}
                        />
                        <span className="text-gray-700 font-medium">{t.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{t.description || '—'}</td>
                    <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{pagination.total} transactions</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
