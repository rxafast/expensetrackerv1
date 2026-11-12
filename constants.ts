import { Category, Account, AppSettings, SavingsGoal, Transaction, FirebaseConfig } from './types';

export const USER_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBZachSPlBNmKFgVrCSUQXkK_nmn70zIXo",
  authDomain: "enermatrix-bdf38.firebaseapp.com",
  databaseURL: "https://enermatrix-bdf38-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "enermatrix-bdf38",
  storageBucket: "enermatrix-bdf38.firebasestorage.app",
  messagingSenderId: "915323020088",
  appId: "1:915323020088:web:4c239e2169cd3af014d7cd",
  measurementId: "G-ZQ3W51VTYS"
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'PKR',
  currencySymbol: 'Rs',
  currencyPosition: 'prefix',
  hideAmounts: false,
  theme: 'light', // Clean luminous white fintech theme by default!
  firebaseConfig: USER_FIREBASE_CONFIG,
  useFirebase: true,
  autoSync: true,
};

// Initial clean accounts without dummy inflated numbers
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Cash in Hand', type: 'cash', initialBalance: 0, color: '#10B981', notes: 'Physical cash' },
  { id: 'acc-2', name: 'Bank Account', type: 'bank', initialBalance: 0, color: '#3B82F6', notes: 'Primary bank account' },
  { id: 'acc-3', name: 'Digital Wallet', type: 'digital_wallet', initialBalance: 0, color: '#F59E0B', notes: 'Easypaisa / JazzCash' },
];

// Clean categories with ability to add custom ones
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Salary', color: '#10B981', type: 'income', icon: 'Briefcase' },
  { id: 'cat-2', name: 'Business & Freelance', color: '#059669', type: 'income', icon: 'Laptop' },
  { id: 'cat-3', name: 'Investments & Returns', color: '#14B8A6', type: 'income', icon: 'TrendingUp' },
  { id: 'cat-4', name: 'Groceries & Food', color: '#F59E0B', type: 'expense', icon: 'ShoppingCart' },
  { id: 'cat-5', name: 'Rent & Housing', color: '#EF4444', type: 'expense', icon: 'Home' },
  { id: 'cat-6', name: 'Transport & Fuel', color: '#3B82F6', type: 'expense', icon: 'Car' },
  { id: 'cat-7', name: 'Utilities & Bills', color: '#6366F1', type: 'expense', icon: 'Zap' },
  { id: 'cat-8', name: 'Dining & Cafes', color: '#F97316', type: 'expense', icon: 'Coffee' },
  { id: 'cat-9', name: 'Health & Medical', color: '#EC4899', type: 'expense', icon: 'HeartPulse' },
  { id: 'cat-10', name: 'Shopping', color: '#D946EF', type: 'expense', icon: 'ShoppingBag' },
  { id: 'cat-11', name: 'Entertainment', color: '#8B5CF6', type: 'expense', icon: 'Film' },
  { id: 'cat-12', name: 'Education', color: '#06B6D4', type: 'expense', icon: 'GraduationCap' },
  { id: 'cat-13', name: 'Other', color: '#6B7280', type: 'both', icon: 'MoreHorizontal' },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [];
export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [];
export const DEFAULT_BUDGETS = [];

export const CATEGORY_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
  '#64748B', '#84CC16', '#EAB308', '#A855F7'
];
