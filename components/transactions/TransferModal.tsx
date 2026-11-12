import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { formatCurrencyWithSettings } from '../../utils/helpers';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, transferFunds, getAccountBalance, settings } = useAppContext();
  
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }

    if (!fromAccountId || !toAccountId) {
      setError('Please select both origin and destination accounts.');
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('Source and Destination accounts cannot be the same.');
      return;
    }

    const sourceBalance = getAccountBalance(fromAccountId);
    if (sourceBalance < parsedAmount) {
      // Allow overdraft if needed or warn
    }

    transferFunds(fromAccountId, toAccountId, parsedAmount, date, description);
    setAmount('');
    setDescription('');
    onClose();
  };

  const fromAcc = accounts.find(a => a.id === fromAccountId);
  const toAcc = accounts.find(a => a.id === toAccountId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Funds Between Accounts">
      <form onSubmit={handleTransfer} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* From Account */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              From (Source)
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-medium focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            {fromAcc && (
              <p className="text-xs text-slate-500 mt-1.5">
                Current: <span className="font-semibold text-slate-700">{formatCurrencyWithSettings(getAccountBalance(fromAcc.id), settings)}</span>
              </p>
            )}
          </div>

          {/* To Account */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              To (Destination)
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-medium focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                  {acc.name}
                </option>
              ))}
            </select>
            {toAcc && (
              <p className="text-xs text-slate-500 mt-1.5">
                Current: <span className="font-semibold text-slate-700">{formatCurrencyWithSettings(getAccountBalance(toAcc.id), settings)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Transfer</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold text-sm">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="1"
              step="any"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-semibold text-base"
              required
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            required
          />
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. ATM cash withdrawal, Credit card bill payment"
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeftRight size={16} />
            <span>Complete Transfer</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransferModal;
