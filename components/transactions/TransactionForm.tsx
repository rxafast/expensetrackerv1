import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { suggestCategory } from '../../services/geminiService';
import { CATEGORY_COLORS } from '../../constants';
import { Sparkles, Tag, Repeat, Plus, Mic, MicOff, Camera, Upload, X, FileText } from 'lucide-react';
import AddCategoryModal from '../budgets/AddCategoryModal';

interface TransactionFormProps {
  transactionToEdit: Transaction | null;
  onClose: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Mobile Wallet',
  'Other',
];

const POPULAR_TAGS = ['groceries', 'work', 'fuel', 'dining', 'bills', 'family', 'shopping', 'personal'];

const TransactionForm: React.FC<TransactionFormProps> = ({ transactionToEdit, onClose }) => {
  const { categories, accounts, addTransaction, updateTransaction, addCategory, settings } = useAppContext();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      setDescription(speechText);
      const matchAmount = speechText.match(/(\d+)/);
      if (matchAmount) {
        setAmount(matchAmount[1]);
      }
      setIsListening(false);
      handleSuggestCategory();
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };
    recognition.start();
  };

  const handleReceiptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setReceiptImage(uploadEvent.target?.result as string);
        setDescription(`Receipt: ${file.name.replace(/\.[^/.]+$/, "")}`);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setAccountId(transactionToEdit.accountId || (accounts[0]?.id || ''));
      setPaymentMethod(transactionToEdit.paymentMethod || 'Cash');
      setDate(transactionToEdit.date.split('T')[0]);
      setDescription(transactionToEdit.description);
      setTags(transactionToEdit.tags || []);
      setNotes(transactionToEdit.notes || '');
      setIsRecurring(Boolean(transactionToEdit.isRecurring));
      setRecurringPeriod(transactionToEdit.recurringPeriod || 'monthly');
    } else {
      if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
      }
      if (categories.length > 0 && !category) {
        const defaultCat = categories.find(c => c.type === 'expense' || c.type === 'both');
        setCategory(defaultCat?.name || categories[0].name);
      }
    }
  }, [transactionToEdit, accounts, categories]);

  const handleSuggestCategory = async () => {
    if (!description.trim()) return;
    setIsSuggesting(true);
    const categoryNames = categories.map(c => c.name);
    const suggested = await suggestCategory(description, categoryNames);
    setCategory(suggested);
    setIsSuggesting(false);
  };

  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().replace(/^#/, '').toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const categoryName = category.trim() || 'Other';

    // Auto-create category if doesn't exist
    const categoryExists = categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!categoryExists) {
      const usedColors = categories.map(c => c.color);
      const availableColors = CATEGORY_COLORS.filter(c => !usedColors.includes(c));
      const newColor = availableColors[0] || CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
      addCategory({ 
        name: categoryName, 
        color: newColor, 
        type: type === 'expense' ? 'expense' : 'income' 
      });
    }

    const transactionData = {
      type,
      amount: parsedAmount,
      category: categoryName,
      accountId: accountId || accounts[0]?.id || '',
      paymentMethod,
      date,
      description: description.trim() || categoryName,
      tags,
      notes: notes.trim(),
      isRecurring,
      recurringPeriod: isRecurring ? recurringPeriod : undefined,
    };

    if (transactionToEdit) {
      updateTransaction({ ...transactionData, id: transactionToEdit.id });
    } else {
      addTransaction(transactionData);
    }
    onClose();
  };

  const filteredCategories = categories.filter(c => {
    if (type === 'income') return c.type === 'income' || c.type === 'both' || c.name === 'Salary';
    return c.type !== 'income';
  });

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1 py-1">
        {/* Smart Voice & Receipt Capture Banner */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 rounded-2xl border border-emerald-500/20 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
              <Sparkles size={15} className="text-emerald-600 animate-pulse" />
              <span>Smart AI Quick Add</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">FAST</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isListening}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isListening 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Mic size={14} className="text-emerald-600" />
              <span className="truncate">{isListening ? "Listening..." : "Voice"}</span>
            </button>

            <label className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs transition-all">
              <Camera size={14} className="text-emerald-600" />
              <span className="truncate">Camera</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleReceiptFile} 
                className="hidden" 
              />
            </label>

            <label className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs transition-all">
              <Upload size={14} className="text-emerald-600" />
              <span className="truncate">Upload</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleReceiptFile} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Receipt preview if attached */}
        {receiptImage && (
          <div className="relative p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center space-x-3">
            <img src={receiptImage} alt="Receipt Preview" className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Receipt Attached</p>
              <p className="text-[10px] text-emerald-600 font-medium">Ready for recording</p>
            </div>
            <button
              type="button"
              onClick={() => setReceiptImage(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Transaction Type</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Amount Input with Quick Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Amount (PKR)</label>
            <div className="flex items-center space-x-1.5">
              {[100, 500, 1000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-400 font-extrabold text-base">
              Rs
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-xl font-black border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900"
              placeholder="0.00"
              required
              min="0.01"
              step="any"
            />
          </div>
        </div>

        {/* Description with AI Suggestion */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="tx-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <button
              type="button"
              onClick={handleSuggestCategory}
              disabled={isSuggesting || !description.trim()}
              className="flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 space-x-1"
            >
              <Sparkles size={13} className={isSuggesting ? "animate-spin" : ""} />
              <span>{isSuggesting ? "Analyzing..." : "Auto-Categorize"}</span>
            </button>
          </div>
          <input
            type="text"
            id="tx-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grocery store, Fuel fill-up, Client payment"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            required
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl"
            >
              <Plus size={13} />
              <span>New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50">
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  category === cat.name
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/80'
                }`}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account & Payment Method Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Account / Wallet</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1">
            <Tag size={13} />
            <span>Tags (Optional)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-emerald-600 hover:text-emerald-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              placeholder="Add tag and press Enter"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Add
            </button>
          </div>
          {/* Popular Tags suggestions */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {POPULAR_TAGS.filter(t => !tags.includes(t)).slice(0, 5).map(pt => (
              <button
                key={pt}
                type="button"
                onClick={() => handleAddTag(pt)}
                className="text-[10px] text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-1.5 py-0.5 rounded"
              >
                +{pt}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Option */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
              <Repeat size={13} />
              <span>Recurring Transaction (Subscription/Salary)</span>
            </span>
          </label>
          {isRecurring && (
            <div className="mt-2 ml-6">
              <select
                value={recurringPeriod}
                onChange={(e) => setRecurringPeriod(e.target.value as any)}
                className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="daily">Repeats Daily</option>
                <option value="weekly">Repeats Weekly</option>
                <option value="monthly">Repeats Monthly</option>
                <option value="yearly">Repeats Yearly</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
            className="px-5 py-2 rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            {transactionToEdit ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>

      {/* Add Category Modal embedded */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        defaultType={type}
        onCategoryCreated={(catName) => setCategory(catName)}
      />
    </>
  );
};

export default TransactionForm;