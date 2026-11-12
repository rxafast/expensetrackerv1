import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import { formatCurrencyWithSettings, formatDate, formatShortDate } from '../../utils/helpers';
import { 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Tag, 
  Download, 
  CheckSquare, 
  Square,
  Calendar,
  Wallet
} from 'lucide-react';
import Modal from '../ui/Modal';
import { exportTransactionsToCSV } from '../../utils/csv';

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
  const { transactions, deleteTransaction, deleteMultipleTransactions, categories, accounts, settings } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    return category ? category.color : '#64748B';
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return '';
    const acc = accounts.find(a => a.id === accountId);
    return acc ? acc.name : '';
  };

  // Filter & sort logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter(t => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        const matchesTag = t.tags?.some(tag => tag.toLowerCase().includes(q));
        const matchesNotes = t.notes?.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat && !matchesTag && !matchesNotes) return false;
      }

      // Type
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Account
      if (accountFilter !== 'all' && t.accountId !== accountFilter && t.toAccountId !== accountFilter) return false;

      // Date range
      const tDate = new Date(t.date);
      if (dateFilter === 'today') {
        if (t.date.split('T')[0] !== todayStr) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        if (tDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateFilter === 'last_month') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (tDate.getMonth() !== lastMonth || tDate.getFullYear() !== lastMonthYear) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && t.date.split('T')[0] < customStartDate) return false;
        if (customEndDate && t.date.split('T')[0] > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, accountFilter, dateFilter, customStartDate, customEndDate, sortBy]);

  // Aggregate stats for filtered transactions
  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFilteredCashflow = totalFilteredIncome - totalFilteredExpense;

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmSingleDelete = () => {
    if (transactionToDeleteId) {
      deleteTransaction(transactionToDeleteId);
      setSelectedIds(prev => prev.filter(id => id !== transactionToDeleteId));
    }
    setTransactionToDeleteId(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.length > 0) {
      deleteMultipleTransactions(selectedIds);
      setSelectedIds([]);
    }
    setIsBulkDeleteModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search by description, category, tag, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Type Pills */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-300">
            {(['all', 'expense', 'income', 'transfer'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  typeFilter === tab
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns Row: Account, Category, Date, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom Range...</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>

        {/* Custom date range inputs */}
        {dateFilter === 'custom' && (
          <div className="flex items-center space-x-2 pt-2 text-xs">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg bg-white"
            />
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>
        )}
      </div>

      {/* Filter Stats & Bulk Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 text-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-1.5 font-semibold text-slate-600 hover:text-slate-900"
          >
            {selectedIds.length > 0 && selectedIds.length === filteredTransactions.length ? (
              <CheckSquare size={16} className="text-emerald-600" />
            ) : (
              <Square size={16} className="text-slate-400" />
            )}
            <span>Select All ({filteredTransactions.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center space-x-1 font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>

        {/* Aggregate Mini Badges */}
        <div className="flex items-center space-x-3 font-medium text-slate-600">
          <span className="text-emerald-600 font-semibold">
            In: +{formatCurrencyWithSettings(totalFilteredIncome, settings)}
          </span>
          <span className="text-rose-600 font-semibold">
            Out: -{formatCurrencyWithSettings(totalFilteredExpense, settings)}
          </span>
          <span className="font-bold text-slate-800">
            Net: {formatCurrencyWithSettings(netFilteredCashflow, settings)}
          </span>
          <button
            onClick={() => exportTransactionsToCSV(filteredTransactions)}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 border border-slate-200 bg-white px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            title="Export filtered records to CSV"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Transactions Table / List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-base font-semibold text-slate-700">No transactions found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {transactions.length === 0 
              ? "Start tracking by recording your first transaction above." 
              : "No records match your active search or filters. Try resetting the filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-3 w-8"></th>
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3">Account & Method</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => {
                const isIncome = t.type === 'income';
                const isTransfer = t.type === 'transfer';
                const isSelected = selectedIds.includes(t.id);
                const fromAccName = getAccountName(t.accountId);
                const toAccName = getAccountName(t.toAccountId);

                return (
                  <tr 
                    key={t.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleSelect(t.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-emerald-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>

                    {/* Details: Icon + Description + Category + Tags */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5"
                          style={{ backgroundColor: getCategoryColor(t.category) }}
                        >
                          {isIncome && <ArrowDownLeft size={18} className="text-white" />}
                          {isTransfer && <ArrowLeftRight size={18} className="text-white" />}
                          {!isIncome && !isTransfer && <ArrowUpRight size={18} className="text-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {t.description}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span 
                              className="px-2 py-0.5 text-[11px] font-semibold rounded-md"
                              style={{ 
                                backgroundColor: `${getCategoryColor(t.category)}18`, 
                                color: getCategoryColor(t.category) 
                              }}
                            >
                              {t.category}
                            </span>
                            {t.tags?.map(tag => (
                              <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                            {t.isRecurring && (
                              <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                                ↻ {t.recurringPeriod}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Account and Payment Method */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-600">
                      {isTransfer ? (
                        <div className="font-medium text-slate-800">
                          {fromAccName} <span className="text-slate-400 font-bold">→</span> {toAccName}
                        </div>
                      ) : (
                        <div className="font-medium text-slate-800">
                          {fromAccName || 'General'}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.paymentMethod || 'Default'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{formatDate(t.date)}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className={`font-bold text-sm ${
                        isIncome ? 'text-emerald-600' :
                        isTransfer ? 'text-indigo-600' :
                        'text-rose-600'
                      }`}>
                        {isIncome ? '+' : isTransfer ? '' : '-'}
                        {formatCurrencyWithSettings(t.amount, settings)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setTransactionToDeleteId(t.id);
                            setIsConfirmModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Single Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Delete Transaction"
      >
        <div>
          <p className="text-sm text-slate-600 mb-5">
            Are you sure you want to permanently delete this transaction? Your balances will be automatically recalculated.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="py-2 px-4 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSingleDelete}
              className="py-2 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700"
            >
              Delete Transaction
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Delete Selected Transactions"
      >
        <div>
          <p className="text-sm text-slate-600 mb-5">
            Are you sure you want to delete <span className="font-bold text-slate-900">{selectedIds.length}</span> selected transactions? This cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="py-2 px-4 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBulkDelete}
              className="py-2 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700"
            >
              Delete {selectedIds.length} Items
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionList;