import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Account, AccountType } from '../../types';
import { formatCurrencyWithSettings, getAccountTypeName } from '../../utils/helpers';
import AccountModal from './AccountModal';
import TransferModal from '../transactions/TransferModal';
import Modal from '../ui/Modal';
import { 
  Building, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  Smartphone, 
  Plus, 
  ArrowLeftRight, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const AccountsPage: React.FC = () => {
  const { accounts, deleteAccount, getAccountBalance, getTotalBalance, transactions, settings } = useAppContext();
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDeleteId, setAccountToDeleteId] = useState<string | null>(null);

  const totalNetWorth = getTotalBalance();

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building size={20} />;
      case 'cash':
        return <Wallet size={20} />;
      case 'credit_card':
        return <CreditCard size={20} />;
      case 'savings':
        return <PiggyBank size={20} />;
      case 'digital_wallet':
        return <Smartphone size={20} />;
      default:
        return <Wallet size={20} />;
    }
  };

  const handleOpenAdd = () => {
    setAccountToEdit(null);
    setIsAccountModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setAccountToEdit(acc);
    setIsAccountModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (accountToDeleteId) {
      deleteAccount(accountToDeleteId);
    }
    setAccountToDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Accounts & Wallets
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your physical cash, bank accounts, digital wallets, credit cards, and savings reserves.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-3.5 rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm"
          >
            <ArrowLeftRight size={17} className="text-slate-600" />
            <span>Transfer</span>
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-sm shadow-emerald-600/20"
          >
            <Plus size={18} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Hero Net Worth Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Net Worth Across All Accounts</span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              {formatCurrencyWithSettings(totalNetWorth, settings)}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Calculated dynamically from {accounts.length} linked accounts & recorded cashflows.
            </p>
          </div>

          <div className="flex items-center space-x-4 divide-x divide-emerald-500/60">
            <div className="pr-4">
              <span className="text-[11px] uppercase font-semibold text-emerald-100">Liquid Cash & Bank</span>
              <div className="text-lg font-bold text-white mt-0.5">
                {formatCurrencyWithSettings(
                  accounts
                    .filter(a => a.type === 'cash' || a.type === 'bank' || a.type === 'digital_wallet')
                    .reduce((sum, a) => sum + getAccountBalance(a.id), 0),
                  settings
                )}
              </div>
            </div>
            <div className="pl-4">
              <span className="text-[11px] uppercase font-semibold text-emerald-100">Savings Reserve</span>
              <div className="text-lg font-bold text-white mt-0.5">
                {formatCurrencyWithSettings(
                  accounts
                    .filter(a => a.type === 'savings')
                    .reduce((sum, a) => sum + getAccountBalance(a.id), 0),
                  settings
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const balance = getAccountBalance(acc.id);
          const isNegative = balance < 0;
          const txCount = transactions.filter(t => t.accountId === acc.id || t.toAccountId === acc.id).length;

          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                {/* Account Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {acc.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {getAccountTypeName(acc.type)} {acc.accountNumber ? `(${acc.accountNumber})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit account"
                    >
                      <Edit2 size={15} />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => {
                          setAccountToDeleteId(acc.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete account"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Balance Section */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Live Balance
                  </span>
                  <div className={`text-2xl font-black tracking-tight mt-0.5 ${
                    isNegative ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {formatCurrencyWithSettings(balance, settings)}
                  </div>
                  {acc.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      "{acc.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{txCount} Transactions recorded</span>
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1"
                >
                  <ArrowLeftRight size={13} />
                  <span>Transfer</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Account Card Button */}
        <button
          onClick={handleOpenAdd}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 transition-all min-h-[190px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
            <Plus size={24} />
          </div>
          <span className="font-bold text-sm">Add Another Account</span>
          <span className="text-xs text-slate-400 mt-0.5">Bank, Cash, Card, or Digital Wallet</span>
        </button>
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
      >
        <div>
          <p className="text-sm text-slate-600 mb-5">
            Are you sure you want to remove this account? Any transactions linked to this account will remain in your ledger.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="py-2 px-4 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="py-2 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountsPage;
