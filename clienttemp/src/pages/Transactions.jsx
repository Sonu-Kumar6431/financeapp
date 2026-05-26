import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionForm from '../components/transactions/TransactionForm';
import CSVImportModal from '../components/transactions/CSVImportModal';

export default function Transactions() {
  const [showForm, setShowForm]     = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleEdit = (t) => { setEditing(t); setShowForm(true); };
  const handleClose = () => { setEditing(null); setShowForm(false); };

  return (
    <PageWrapper
      title="Transactions"
      subtitle="Manage all your income and expense records"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Transaction
        </button>
      }
    >
      <TransactionTable
        onEdit={handleEdit}
        onImport={() => setShowImport(true)}
        refreshKey={refreshKey}
      />

      <TransactionForm
        isOpen={showForm}
        onClose={handleClose}
        onSuccess={refresh}
        transaction={editing}
      />

      <CSVImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={refresh}
      />
    </PageWrapper>
  );
}
