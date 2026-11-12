import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings, formatDate } from '../../utils/helpers';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

interface RecentTransactionsListProps {
  onOpenAddModal?: () => void;
  onViewAll?: () => void;
}

const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ onOpenAddModal, onViewAll }) => {
  const { transactions, categories, accounts, settings } = useAppContext();

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    return category ? category.color : '#64748B';
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return '';
    const acc = accounts.find(a => a.id === accountId);
    return acc ? acc.name : '';
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-slate-500 mb-2">No transactions recorded yet.</p>
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
          >
            + Record first transaction
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentTransactions.map(t => {
        const isIncome = t.type === 'income';
        const isTransfer = t.type === 'transfer';
        const catColor = getCategoryColor(t.category);
        const accName = getAccountName(t.accountId);

        return (
          <div 
            key={t.id} 
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-xs"
                style={{ backgroundColor: catColor }}
              >
                {isIncome && <ArrowDownLeft size={17} />}
                {isTransfer && <ArrowLeftRight size={17} />}
                {!isIncome && !isTransfer && <ArrowUpRight size={17} />}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                  {t.description}
                </p>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                  <span className="truncate">{t.category}</span>
                  {accName && (
                    <>
                      <span>&bull;</span>
                      <span className="truncate">{accName}</span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span>{formatDate(t.date)}</span>
                </div>
              </div>
            </div>

            <div className={`font-bold text-xs sm:text-sm whitespace-nowrap pl-2 ${
              isIncome ? 'text-emerald-600' :
              isTransfer ? 'text-indigo-600' :
              'text-rose-600'
            }`}>
              {isIncome ? '+' : isTransfer ? '' : '-'}
              {formatCurrencyWithSettings(t.amount, settings)}
            </div>
          </div>
        );
      })}

      {onViewAll && (
        <div className="pt-2 text-center border-t border-slate-100">
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            View All Ledger Transactions &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsList;
