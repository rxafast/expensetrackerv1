import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import { Wallet, Building, CreditCard, PiggyBank, Smartphone } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit: Account | null;
}

const ACCOUNT_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#64748B'
];

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, accountToEdit }) => {
  const { addAccount, updateAccount, settings } = useAppContext();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setInitialBalance(String(accountToEdit.initialBalance));
      setColor(accountToEdit.color);
      setAccountNumber(accountToEdit.accountNumber || '');
      setNotes(accountToEdit.notes || '');
    } else {
      setName('');
      setType('bank');
      setInitialBalance('0');
      setColor(ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)]);
      setAccountNumber('');
      setNotes('');
    }
  }, [accountToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      type,
      initialBalance: parseFloat(initialBalance) || 0,
      color,
      accountNumber: accountNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (accountToEdit) {
      updateAccount({ ...data, id: accountToEdit.id });
    } else {
      addAccount(data);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? 'Edit Account / Wallet' : 'Add New Account or Wallet'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Standard Chartered Bank, Cash in Pocket, JazzCash"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            required
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Account Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'bank' as const, label: 'Bank Account', icon: <Building size={16} /> },
              { id: 'cash' as const, label: 'Cash / Wallet', icon: <Wallet size={16} /> },
              { id: 'credit_card' as const, label: 'Credit Card', icon: <CreditCard size={16} /> },
              { id: 'savings' as const, label: 'Savings Reserve', icon: <PiggyBank size={16} /> },
              { id: 'digital_wallet' as const, label: 'Mobile Wallet', icon: <Smartphone size={16} /> },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  type === item.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={type === item.id ? 'text-emerald-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Starting / Initial Balance */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {accountToEdit ? 'Adjust Starting Balance' : 'Initial / Starting Balance'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold"
              placeholder="0.00"
              step="any"
              required
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Current balance will be calculated as Starting Balance + Incomes - Expenses ± Transfers.
          </p>
        </div>

        {/* Account Number / Identifier */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Account / Card Number (Optional)
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="e.g. Last 4 digits: ...4892"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Color Accent</label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Salary account with 2% cashback"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            {accountToEdit ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AccountModal;
