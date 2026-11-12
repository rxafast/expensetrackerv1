import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppContext } from '../../context/AppContext';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGooglePopup, sendPasswordReset, currentUser, signOut } = useAppContext();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (password.length < 6) {
          setError('Password should be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        onClose();
      } else if (mode === 'forgot') {
        await sendPasswordReset(email);
        setSuccessMsg(`Password reset email sent to ${email}. Check your inbox!`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'An account already exists with this email address. Try logging in.';
      } else if (msg.includes('invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGooglePopup();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in
  if (currentUser) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Account Profile">
        <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center mx-auto border-2 border-emerald-500">
            {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{currentUser.displayName || 'Tracker Pro User'}</h3>
            <p className="text-sm text-slate-500">{currentUser.email}</p>
            <div className="inline-flex items-center space-x-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck size={14} />
              <span>Firebase Cloud Synced</span>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm shadow-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login' ? 'Sign In to Tracker Pro' :
        mode === 'register' ? 'Create Tracker Pro Account' :
        'Reset Account Password'
      }
    >
      <div className="space-y-4">
        {/* Toggle between Login and Register */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register New
            </button>
          </div>
        )}

        {/* Error / Success messages */}
        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-xs font-medium rounded-xl border border-red-200 flex items-start space-x-2">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-200 flex items-start space-x-2">
            <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rizwan"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-xs text-emerald-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            {mode === 'login' ? <LogIn size={16} /> : mode === 'register' ? <UserPlus size={16} /> : <Mail size={16} />}
            <span>
              {isLoading ? 'Processing...' : 
               mode === 'login' ? 'Sign In to Tracker' : 
               mode === 'register' ? 'Create Account' : 
               'Send Reset Instructions'}
            </span>
          </button>
        </form>

        {mode === 'forgot' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              &larr; Back to Sign In
            </button>
          </div>
        )}

        {/* Google Sign-in */}
        {mode !== 'forgot' && (
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-400">
          Connected to Firebase Project: <span className="font-mono font-medium text-slate-600">enermatrix-bdf38</span>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
