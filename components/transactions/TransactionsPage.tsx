import React, { useState } from 'react';
import Card from '../ui/Card';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import TransferModal from './TransferModal';
import Modal from '../ui/Modal';
import { Transaction } from '../../types';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';

const TransactionsPage: React.FC = () => {
  const { transactions, settings } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenModal = (transaction: Transaction | null = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transactions & Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, filter, search, and manage all your income, expenses, and account transfers.
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
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-sm shadow-emerald-600/20"
          >
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <TransactionList onEdit={handleOpenModal} />
      </div>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
      >
        <TransactionForm
          transactionToEdit={editingTransaction}
          onClose={handleCloseModal}
        />
      </Modal>

      {/* Transfer Funds Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};

export default TransactionsPage;