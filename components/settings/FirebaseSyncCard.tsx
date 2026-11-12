import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FirebaseConfig } from '../../types';
import { testFirebaseConnection } from '../../services/firebaseService';
import { USER_FIREBASE_CONFIG } from '../../constants';
import { 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Key, 
  HelpCircle, 
  ExternalLink,
  ClipboardPaste,
  ShieldCheck,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';

const FirebaseSyncCard: React.FC = () => {
  const { settings, updateSettings, syncToCloud, pullFromCloud, isSyncing, syncStatus, currentUser } = useAppContext();
  
  const existingConfig = settings.firebaseConfig || USER_FIREBASE_CONFIG;

  const [config, setConfig] = useState<FirebaseConfig>(existingConfig);
  const [pasteSnippet, setPasteSnippet] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isConnected = Boolean(config.apiKey && config.projectId);

  // Parse pasted firebaseConfig JS snippet
  const handleParsePastedConfig = () => {
    if (!pasteSnippet.trim()) return;

    try {
      const extract = (key: string) => {
        const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const match = pasteSnippet.match(regex);
        return match ? match[1] : '';
      };

      const parsed: FirebaseConfig = {
        apiKey: extract('apiKey') || config.apiKey,
        authDomain: extract('authDomain') || config.authDomain,
        projectId: extract('projectId') || config.projectId,
        databaseURL: extract('databaseURL') || config.databaseURL,
        storageBucket: extract('storageBucket') || config.storageBucket,
        messagingSenderId: extract('messagingSenderId') || config.messagingSenderId,
        appId: extract('appId') || config.appId,
      };

      if (!parsed.apiKey || !parsed.projectId) {
        try {
          const json = JSON.parse(pasteSnippet);
          if (json.apiKey && json.projectId) {
            setConfig(json);
            setTestResult({ success: true, message: 'Extracted credentials from JSON successfully!' });
            return;
          }
        } catch {}
      }

      setConfig(parsed);
      setTestResult({
        success: true,
        message: 'Successfully extracted Firebase configuration! Click "Save & Test Connection" below.',
      });
      setPasteSnippet('');
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Could not auto-parse snippet. Please paste or enter the fields manually below.',
      });
    }
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) {
      setTestResult({
        success: false,
        message: 'apiKey and projectId are required to connect to Firebase.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testFirebaseConnection(config);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      updateSettings({
        firebaseConfig: config,
        useFirebase: true,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Database size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Firebase Database: enermatrix-bdf38</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 size={12} />
                <span>Configured</span>
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live sync active with your Firebase Firestore & Realtime Database.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 self-start sm:self-center"
        >
          <HelpCircle size={14} />
          <span>{showHelp ? 'Hide Config' : 'View Configuration Details'}</span>
        </button>
      </div>

      {/* Guide / Info */}
      {showHelp && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
            <Key size={16} className="text-amber-500" />
            <span>Active Project Settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-slate-600 pt-1">
            <div>Project: <span className="text-slate-900 font-semibold">{config.projectId}</span></div>
            <div>Auth Domain: <span className="text-slate-900 font-semibold">{config.authDomain}</span></div>
            <div>Database URL: <span className="text-slate-900 font-semibold truncate block">{config.databaseURL}</span></div>
            <div>Storage Bucket: <span className="text-slate-900 font-semibold">{config.storageBucket}</span></div>
          </div>
        </div>
      )}

      {/* Test Result Message */}
      {testResult && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
          testResult.success 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Sync Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleTestAndSave}
            disabled={isTesting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:bg-slate-400"
          >
            {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
            <span>{isTesting ? 'Verifying...' : 'Test Connection'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => syncToCloud()}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <ArrowUpFromLine size={13} />
            <span>{isSyncing ? "Syncing..." : "Sync Local Data to Cloud"}</span>
          </button>
          <button
            type="button"
            onClick={() => pullFromCloud()}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 border border-slate-200"
          >
            <ArrowDownToLine size={13} />
            <span>Fetch Data from Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSyncCard;
