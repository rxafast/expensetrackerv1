import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import SummaryCard from './SummaryCard';
import ExpenseChart from './ExpenseChart';
import RecentTransactionsList from './RecentTransactionsList';
import { formatCurrencyWithSettings } from '../../utils/helpers';
import { generateFinancialAudit } from '../../services/geminiService';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  ArrowLeftRight, 
  Plus, 
  Sparkles, 
  Target, 
  AlertTriangle,
  Building,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Cloud,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { View } from '../../App';
import AuthModal from '../auth/AuthModal';

interface DashboardProps {
  setView: (view: View) => void;
  onOpenAddModal: () => void;
  onOpenTransferModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, onOpenAddModal, onOpenTransferModal }) => {
  const { 
    transactions, 
    accounts, 
    budgets, 
    categories, 
    savingsGoals, 
    getTotalBalance, 
    getAccountBalance, 
    settings, 
    toggleHideAmounts,
    syncToCloud,
    pullFromCloud,
    isSyncing,
    currentUser
  } = useAppContext();

  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;
  const totalBalance = getTotalBalance();
  const savingsRate = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 100) : 0;

  const dayOfMonth = Math.max(1, now.getDate());
  const dailyAverageExpense = totalExpenses / dayOfMonth;

  // Budget warnings
  const budgetAlerts = budgets.map(b => {
    const cat = categories.find(c => c.id === b.categoryId);
    const spent = currentMonthTransactions
      .filter(t => t.type === 'expense' && cat && t.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    return { catName: cat?.name || 'Category', spent, limit: b.amount, percent };
  }).filter(item => item.percent >= 80);

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    const report = await generateFinancialAudit(transactions, accounts);
    setAiAuditReport(report);
    setIsAuditing(false);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Building size={16} />;
      case 'cash': return <Wallet size={16} />;
      case 'credit_card': return <CreditCard size={16} />;
      case 'savings': return <PiggyBank size={16} />;
      case 'digital_wallet': return <Smartphone size={16} />;
      default: return <Wallet size={16} />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Financial Overview
            </h1>
            <button
              onClick={toggleHideAmounts}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
              title={settings.hideAmounts ? "Show amounts" : "Privacy mode (hide amounts)"}
            >
              {settings.hideAmounts ? <EyeOff size={18} className="text-amber-500" /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentUser ? `Welcome back, ${currentUser.displayName || currentUser.email}` : 'Ready for tracking'} &bull; Currency: <span className="font-semibold text-emerald-600">PKR (Rs)</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Sync Button */}
          <button
            onClick={() => syncToCloud()}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            title="Sync to Firebase Realtime Database"
          >
            <Cloud size={14} className="text-emerald-600" />
            <span>{isSyncing ? "Syncing..." : "Sync Cloud"}</span>
            {isSyncing && <RefreshCw size={11} className="animate-spin ml-1 text-emerald-600" />}
          </button>

          <button
            onClick={handleRunAiAudit}
            disabled={isAuditing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} className={isAuditing ? "animate-spin text-purple-600" : "text-purple-600"} />
            <span>{isAuditing ? "Auditing..." : "AI Health Check"}</span>
          </button>

          <button
            onClick={onOpenTransferModal}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowLeftRight size={14} />
            <span>Transfer</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-emerald-600/20 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>

          {!currentUser && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Financial Audit Banner if generated */}
      {aiAuditReport && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-purple-500/30 rounded-xl">
                <Sparkles size={20} className="text-purple-300" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">FinTrack AI Financial Audit</h3>
            </div>
            <button
              onClick={() => setAiAuditReport(null)}
              className="text-xs text-purple-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-purple-100 whitespace-pre-line leading-relaxed">
            {aiAuditReport}
          </p>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Net Worth"
          amount={totalBalance}
          subtitle={`Across ${accounts.length} active wallets`}
          icon={<Wallet className="text-emerald-600" size={18} />}
          color="text-slate-900"
        />

        <SummaryCard
          title="Month Income"
          amount={totalIncome}
          subtitle={`${currentMonthTransactions.filter(t => t.type === 'income').length} deposits recorded`}
          icon={<TrendingUp className="text-emerald-500" size={18} />}
          color="text-emerald-600"
          trend="+ Inflow"
          trendPositive={true}
        />

        <SummaryCard
          title="Month Expenses"
          amount={totalExpenses}
          subtitle={`Avg. ${formatCurrencyWithSettings(dailyAverageExpense, settings)}/day`}
          icon={<TrendingDown className="text-rose-500" size={18} />}
          color="text-rose-600"
          trend="- Outflow"
          trendPositive={false}
        />

        <SummaryCard
          title="Net Cashflow"
          amount={netCashFlow}
          subtitle={savingsRate > 0 ? `${savingsRate}% savings rate` : 'Cash outflow deficit'}
          icon={<PiggyBank className={netCashFlow >= 0 ? "text-emerald-600" : "text-rose-500"} size={18} />}
          color={netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"}
          trend={netCashFlow >= 0 ? "Surplus" : "Deficit"}
          trendPositive={netCashFlow >= 0}
        />
      </div>

      {/* Wallets & Accounts Quick Strip */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Accounts & Wallets</span>
          <button
            onClick={() => setView('accounts')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Manage Accounts &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {accounts.map(acc => {
            const bal = getAccountBalance(acc.id);
            return (
              <div
                key={acc.id}
                onClick={() => setView('accounts')}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {getAccountIcon(acc.type)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">{acc.name}</span>
                </div>
                <div className={`mt-2.5 text-base font-black tracking-tight ${bal < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {formatCurrencyWithSettings(bal, settings)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Limit Alerts if any */}
      {budgetAlerts.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Budget Alert: </span>
              {budgetAlerts.map(b => `${b.catName} is at ${b.percent}% of budget`).join(' • ')}
            </div>
          </div>
          <button
            onClick={() => setView('budgets')}
            className="text-xs font-bold text-amber-800 underline whitespace-nowrap ml-2"
          >
            View Budgets
          </button>
        </div>
      )}

      {/* Charts & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Expense Breakdown Chart */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <ExpenseChart transactions={transactions} />
        </div>

        {/* Right: Recent Transactions & Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
              <button
                onClick={() => setView('transactions')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                View Ledger
              </button>
            </div>
            <RecentTransactionsList
              onOpenAddModal={onOpenAddModal}
              onViewAll={() => setView('transactions')}
            />
          </div>

          {/* Quick Savings Goals Widget */}
          {savingsGoals.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Savings Milestones</span>
                <button
                  onClick={() => setView('budgets')}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  All Goals
                </button>
              </div>

              <div className="space-y-3">
                {savingsGoals.slice(0, 2).map(goal => {
                  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                  return (
                    <div key={goal.id} className="text-xs">
                      <div className="flex justify-between font-medium text-slate-800 mb-1">
                        <span>{goal.name}</span>
                        <span>{formatCurrencyWithSettings(goal.currentAmount, settings)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: goal.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;