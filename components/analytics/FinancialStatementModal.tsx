import React, { useRef } from 'react';
import Modal from '../ui/Modal';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings, formatDate } from '../../utils/helpers';
import { Printer, Download, Landmark, CheckCircle2 } from 'lucide-react';

interface FinancialStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinancialStatementModal: React.FC<FinancialStatementModalProps> = ({ isOpen, onClose }) => {
  const { transactions, accounts, settings, getTotalBalance } = useAppContext();
  const printRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const netWorth = getTotalBalance();

  // Category breakdown
  const categorySummary: { [key: string]: number } = {};
  currentMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Personal Financial Statement Report">
      <div className="space-y-5">
        <div className="flex justify-end space-x-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 text-slate-800">
          {/* Statement Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">PocketTracker Pro Statement</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Personal Cashflow & Expense Audit</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-900">Period: {monthName}</p>
              <p className="text-slate-500 mt-0.5">Generated: {formatDate(now.toISOString())}</p>
            </div>
          </div>

          {/* High level overview */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Total Inflow</span>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                +{formatCurrencyWithSettings(totalIncome, settings)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Total Outflow</span>
              <div className="text-base font-bold text-rose-600 mt-0.5">
                -{formatCurrencyWithSettings(totalExpense, settings)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Net Period Savings</span>
              <div className={`text-base font-bold mt-0.5 ${netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrencyWithSettings(netSavings, settings)}
              </div>
            </div>
          </div>

          {/* Account Balances Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Account Status & Balances
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Account / Wallet</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map(acc => (
                    <tr key={acc.id}>
                      <td className="p-2.5 font-medium text-slate-800">{acc.name}</td>
                      <td className="p-2.5 capitalize text-slate-500">{acc.type.replace('_', ' ')}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatCurrencyWithSettings(acc.initialBalance, settings)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2.5 text-slate-900" colSpan={2}>Total Liquidity & Assets</td>
                    <td className="p-2.5 text-right text-emerald-700">
                      {formatCurrencyWithSettings(netWorth, settings)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Outflow Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Spending by Category
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(categorySummary).map(([cat, val]) => (
                    <tr key={cat}>
                      <td className="p-2.5 font-medium text-slate-800">{cat}</td>
                      <td className="p-2.5 text-right font-semibold text-slate-900">
                        {formatCurrencyWithSettings(val, settings)}
                      </td>
                      <td className="p-2.5 text-right text-slate-500">
                        {totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Generated via Tracker Pro &bull; Personal Ledger Statement
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FinancialStatementModal;
