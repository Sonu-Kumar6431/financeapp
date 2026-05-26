import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { transactionApi } from '../../api';

export default function CSVImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleImport = async () => {
    if (!file) return toast.error('Select a CSV file first');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await transactionApi.importCSV(fd);
      setResult(res.data.message);
      toast.success(res.data.message);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setFile(null); setResult(null); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import CSV">
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
          <strong>Required columns:</strong> date, type (income/expense), amount, category, description
        </div>

        {!result ? (
          <>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors">
              <Upload size={28} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium">{file ? file.name : 'Click to upload CSV'}</span>
              <span className="text-xs text-gray-400 mt-1">Max 5MB</span>
              <input type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <a
              href="/sample-import.csv"
              download
              className="flex items-center gap-2 text-xs text-primary-600 hover:underline"
            >
              <FileText size={12} /> Download sample CSV template
            </a>

            <div className="flex gap-2">
              <button onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleImport} className="btn-primary flex-1" disabled={loading || !file}>
                {loading ? 'Importing…' : 'Import'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6 gap-3">
            <CheckCircle size={40} className="text-green-500" />
            <p className="text-gray-700 font-medium">{result}</p>
            <button onClick={handleClose} className="btn-primary">Done</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
