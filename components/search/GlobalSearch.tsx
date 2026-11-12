import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Transaction, Category, Account } from '../../types';
import { Search, Target, DollarSign, Wallet, ArrowLeftRight } from 'lucide-react';
import { View } from '../../App';
import { formatCurrencyWithSettings, formatDate } from '../../utils/helpers';

interface SearchResults {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}

interface GlobalSearchProps {
  setView: (view: View) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ setView }) => {
  const { transactions, categories, accounts, settings } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ transactions: [], categories: [], accounts: [] });
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length > 1) {
        const lowerCaseQuery = query.toLowerCase();
        const filteredTransactions = transactions.filter(t => 
          t.description.toLowerCase().includes(lowerCaseQuery) ||
          t.category.toLowerCase().includes(lowerCaseQuery) ||
          t.tags?.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
        ).slice(0, 5);

        const filteredCategories = categories.filter(c => 
          c.name.toLowerCase().includes(lowerCaseQuery)
        ).slice(0, 4);

        const filteredAccounts = accounts.filter(a =>
          a.name.toLowerCase().includes(lowerCaseQuery) ||
          a.type.toLowerCase().includes(lowerCaseQuery)
        ).slice(0, 4);

        setResults({ 
          transactions: filteredTransactions, 
          categories: filteredCategories,
          accounts: filteredAccounts 
        });
      } else {
        setResults({ transactions: [], categories: [], accounts: [] });
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, transactions, categories, accounts]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (view: View) => {
    setView(view);
    setQuery('');
    setResults({ transactions: [], categories: [], accounts: [] });
    setIsFocused(false);
  };
  
  const hasResults = results.transactions.length > 0 || results.categories.length > 0 || results.accounts.length > 0;

  return (
    <div className="relative w-60 sm:w-80" ref={searchRef}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </span>
      <input
        type="text"
        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all placeholder:text-slate-400"
        placeholder="Search ledger, categories, wallets..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
      />
      {isFocused && query.length > 1 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {hasResults ? (
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {results.transactions.length > 0 && (
                <>
                  <li className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                    Transactions
                  </li>
                  {results.transactions.map(t => (
                    <li 
                      key={t.id} 
                      onClick={() => handleResultClick('transactions')} 
                      className="px-3.5 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          t.type === 'income' ? 'bg-emerald-500' :
                          t.type === 'transfer' ? 'bg-indigo-500' :
                          'bg-rose-500'
                        }`} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{t.description}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.category} &bull; {formatDate(t.date)}</p>
                        </div>
                      </div>
                      <p className={`font-bold whitespace-nowrap pl-2 ${
                        t.type === 'income' ? 'text-emerald-600' :
                        t.type === 'transfer' ? 'text-indigo-600' :
                        'text-rose-600'
                      }`}>
                        {formatCurrencyWithSettings(t.amount, settings)}
                      </p>
                    </li>
                  ))}
                </>
              )}

              {results.accounts.length > 0 && (
                <>
                  <li className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                    Accounts & Wallets
                  </li>
                  {results.accounts.map(a => (
                    <li 
                      key={a.id} 
                      onClick={() => handleResultClick('accounts')} 
                      className="px-3.5 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Wallet size={14} className="text-emerald-600" />
                        <span className="font-medium text-slate-800">{a.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">{a.type}</span>
                    </li>
                  ))}
                </>
              )}

              {results.categories.length > 0 && (
                <>
                  <li className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                    Categories
                  </li>
                  {results.categories.map(c => (
                    <li 
                      key={c.id} 
                      onClick={() => handleResultClick('budgets')} 
                      className="px-3.5 py-2 hover:bg-slate-50 cursor-pointer flex items-center space-x-2.5 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <p className="font-medium text-slate-800">{c.name}</p>
                    </li>
                  ))}
                </>
              )}
            </ul>
          ) : (
            <div className="p-4 text-xs text-center text-slate-500">
              No matching records found for "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
