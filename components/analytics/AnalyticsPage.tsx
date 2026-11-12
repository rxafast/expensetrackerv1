import React, { useState } from 'react';
import Card from '../ui/Card';
import IncomeExpenseTrendChart from './IncomeExpenseTrendChart';
import CategorySpendingChart from './CategorySpendingChart';
import KeyMetrics from './KeyMetrics';
import FinancialStatementModal from './FinancialStatementModal';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';
import { FileText, Printer, BarChart2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const { transactions, settings } = useAppContext();
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Group by month for detailed breakdown table
  const monthlyBreakdown = React.useMemo(() => {
    const map: { [key: string]: { monthKey: string; label: string; income: number; expense: number; txCount: number } } = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!map[key]) {
        map[key] = { monthKey: key, label, income: 0, expense: 0, txCount: 0 };
      }

      if (t.type === 'income') {
        map[key].income += t.amount;
      } else if (t.type === 'expense') {
        map[key].expense += t.amount;
      }
      map[key].txCount += 1;
    });

    return Object.values(map).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [transactions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Deep dive into long-term cash flow trends, category velocity, and generate official statements.
          </p>
        </div>

        <button
          onClick={() => setIsStatementModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
        >
          <FileText size={16} />
          <span>Print Financial Statement</span>
        </button>
      </div>

      {/* Key Metrics */}
      <KeyMetrics />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[28rem]">
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-900">Income vs. Expense Trend</h2>
            <p className="text-xs text-slate-500">Historical cashflow trajectory over past 12 months.</p>
          </div>
          <div className="flex-1 min-h-0">
            <IncomeExpenseTrendChart />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[28rem]">
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-900">Category Spending Distribution</h2>
            <p className="text-xs text-slate-500">Highest volume cost centers and budget drains.</p>
          </div>
          <div className="flex-1 min-h-0">
            <CategorySpendingChart />
          </div>
        </div>
      </div>

      {/* Detailed Monthly Cash Flow Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Monthly Cash Flow Statement</h2>
            <p className="text-xs text-slate-500">Summary table showing net surplus/deficit per month.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Month</th>
                <th className="p-3 text-right">Inflow (+)</th>
                <th className="p-3 text-right">Outflow (-)</th>
                <th className="p-3 text-right">Net Savings</th>
                <th className="p-3 text-right">Savings Rate</th>
                <th className="p-3 text-center">Tx Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyBreakdown.map(m => {
                const net = m.income - m.expense;
                const rate = m.income > 0 ? Math.round((net / m.income) * 100) : 0;

                return (
                  <tr key={m.monthKey} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{m.label}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600">
                      +{formatCurrencyWithSettings(m.income, settings)}
                    </td>
                    <td className="p-3 text-right font-semibold text-rose-600">
                      -{formatCurrencyWithSettings(m.expense, settings)}
                    </td>
                    <td className={`p-3 text-right font-bold ${net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatCurrencyWithSettings(net, settings)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        rate > 20 ? 'bg-emerald-50 text-emerald-700' :
                        rate > 0 ? 'bg-blue-50 text-blue-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-500 font-medium">{m.txCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Modal */}
      <FinancialStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
      />
    </div>
  );
};

export default AnalyticsPage;
