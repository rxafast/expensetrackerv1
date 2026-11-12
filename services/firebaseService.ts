import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child,
  Database
} from 'firebase/database';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  writeBatch,
  Firestore
} from 'firebase/firestore';
import { FirebaseConfig, Transaction, Account, Category, Budget, SavingsGoal, AppSettings, AuthUser } from '../types';
import { USER_FIREBASE_CONFIG } from '../constants';

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let databaseInstance: Database | null = null;
let firestoreInstance: Firestore | null = null;

export const initFirebase = (config: FirebaseConfig = USER_FIREBASE_CONFIG): { 
  app: FirebaseApp; 
  auth: Auth; 
  rtdb: Database; 
  db: Firestore 
} => {
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(config);
    }

    authInstance = getAuth(firebaseApp);
    databaseInstance = getDatabase(firebaseApp, config.databaseURL);
    firestoreInstance = getFirestore(firebaseApp);

    return { 
      app: firebaseApp, 
      auth: authInstance, 
      rtdb: databaseInstance, 
      db: firestoreInstance 
    };
  } catch (err: any) {
    console.error('Firebase initialization error:', err);
    throw err;
  }
};

// Initialize immediately
initFirebase(USER_FIREBASE_CONFIG);

export const getFirebaseAuth = (): Auth => {
  if (!authInstance) initFirebase();
  return authInstance!;
};

export const getFirebaseRtdb = (): Database => {
  if (!databaseInstance) initFirebase();
  return databaseInstance!;
};

export const getFirebaseDb = (): Firestore => {
  if (!firestoreInstance) initFirebase();
  return firestoreInstance!;
};

// Auth functions
export const loginWithEmail = async (email: string, pass: string): Promise<AuthUser> => {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

export const registerWithEmail = async (email: string, pass: string, name?: string): Promise<AuthUser> => {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;
  if (name && name.trim()) {
    try {
      await updateProfile(user, { displayName: name.trim() });
    } catch {}
  }
  return {
    uid: user.uid,
    email: user.email,
    displayName: name?.trim() || user.displayName,
    photoURL: user.photoURL,
  };
};

export const loginWithGoogle = async (): Promise<AuthUser> => {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

export const logoutUser = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  await fbSignOut(auth);
};

export const sendResetPassword = async (email: string): Promise<void> => {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email.trim());
};

export const subscribeToAuth = (callback: (user: AuthUser | null) => void): (() => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

export interface SyncDataPayload {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings?: AppSettings;
}

// Helper to convert arrays into object map for RTDB
const arrayToMap = (arr: any[] = []) => {
  const map: Record<string, any> = {};
  arr.forEach((item, idx) => {
    const key = item.id || `item_${idx}`;
    map[key] = item;
  });
  return map;
};

// Helper to convert RTDB snapshot/object back to array
const mapToArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'object') {
    return Object.entries(val).map(([k, v]: [string, any]) => {
      if (typeof v === 'object' && v !== null) {
        return { ...v, id: v.id || k };
      }
      return v;
    });
  }
  return [];
};

// Save user data to both Firebase Realtime Database and Firestore
export const saveUserDataToCloud = async (
  userId: string,
  data: SyncDataPayload
): Promise<{ success: boolean; message: string; count: number }> => {
  let rtdbSuccess = false;
  let firestoreSuccess = false;
  let errors: string[] = [];

  const totalCount = data.transactions.length + data.accounts.length + data.budgets.length + data.savingsGoals.length;

  // 1. Save to Realtime Database (using databaseURL)
  try {
    const rtdb = getFirebaseRtdb();
    const rtdbPayload = {
      transactions: arrayToMap(data.transactions),
      accounts: arrayToMap(data.accounts),
      categories: arrayToMap(data.categories),
      budgets: arrayToMap(data.budgets),
      savingsGoals: arrayToMap(data.savingsGoals),
      lastSyncedAt: new Date().toISOString()
    };

    // Save at root path and user path
    await Promise.all([
      set(ref(rtdb, `users/${userId}`), rtdbPayload),
      set(ref(rtdb, 'transactions'), rtdbPayload.transactions),
      set(ref(rtdb, 'accounts'), rtdbPayload.accounts),
      set(ref(rtdb, 'categories'), rtdbPayload.categories),
      set(ref(rtdb, 'budgets'), rtdbPayload.budgets),
    ]);
    rtdbSuccess = true;
  } catch (err: any) {
    console.warn('Realtime Database save error:', err);
    errors.push(`RTDB: ${err.message || 'Permission denied'}`);
  }

  // 2. Also save to Firestore
  try {
    const db = getFirebaseDb();
    const batch = writeBatch(db);

    for (const tx of data.transactions) {
      const refDoc = doc(db, 'users', userId, 'transactions', tx.id);
      batch.set(refDoc, tx, { merge: true });
    }

    for (const acc of data.accounts) {
      const refDoc = doc(db, 'users', userId, 'accounts', acc.id);
      batch.set(refDoc, acc, { merge: true });
    }

    for (const cat of data.categories) {
      const refDoc = doc(db, 'users', userId, 'categories', cat.id);
      batch.set(refDoc, cat, { merge: true });
    }

    for (const b of data.budgets) {
      const refDoc = doc(db, 'users', userId, 'budgets', b.id);
      batch.set(refDoc, b, { merge: true });
    }

    await batch.commit();
    firestoreSuccess = true;
  } catch (err: any) {
    console.warn('Firestore save error:', err);
    errors.push(`Firestore: ${err.message || 'Permission denied'}`);
  }

  if (rtdbSuccess || firestoreSuccess) {
    return {
      success: true,
      message: `Successfully synced ${totalCount} records to Firebase!`,
      count: totalCount
    };
  }

  return {
    success: false,
    message: `Firebase sync failed: ${errors.join('; ')}`,
    count: 0
  };
};

// Fetch user data from Firebase (checks Realtime Database and Firestore)
export const fetchUserDataFromCloud = async (
  userId: string
): Promise<{ success: boolean; data?: Partial<SyncDataPayload>; message?: string }> => {
  let foundTransactions: Transaction[] = [];
  let foundAccounts: Account[] = [];
  let foundCategories: Category[] = [];
  let foundBudgets: Budget[] = [];
  let foundGoals: SavingsGoal[] = [];

  // 1. Try Firebase Realtime Database first (which is what enermatrix RTDB uses)
  try {
    const rtdb = getFirebaseRtdb();
    const dbRef = ref(rtdb);

    // Try multiple possible paths where existing apps store records:
    // Path A: users/{userId}
    // Path B: root /transactions, /expenses, /accounts, /categories, /budgets
    // Path C: /data
    const [userSnap, rootTxSnap, rootExpenseSnap, rootAccSnap, rootCatSnap, rootBudgetSnap] = await Promise.all([
      get(child(dbRef, `users/${userId}`)).catch(() => null),
      get(child(dbRef, 'transactions')).catch(() => null),
      get(child(dbRef, 'expenses')).catch(() => null),
      get(child(dbRef, 'accounts')).catch(() => null),
      get(child(dbRef, 'categories')).catch(() => null),
      get(child(dbRef, 'budgets')).catch(() => null),
    ]);

    if (userSnap && userSnap.exists()) {
      const val = userSnap.val();
      if (val.transactions) foundTransactions = mapToArray(val.transactions);
      if (val.accounts) foundAccounts = mapToArray(val.accounts);
      if (val.categories) foundCategories = mapToArray(val.categories);
      if (val.budgets) foundBudgets = mapToArray(val.budgets);
      if (val.savingsGoals) foundGoals = mapToArray(val.savingsGoals);
    }

    // If transactions still empty, check root /transactions or /expenses
    if (foundTransactions.length === 0) {
      if (rootTxSnap && rootTxSnap.exists()) {
        foundTransactions = mapToArray(rootTxSnap.val());
      } else if (rootExpenseSnap && rootExpenseSnap.exists()) {
        const rawExpenses = mapToArray(rootExpenseSnap.val());
        foundTransactions = rawExpenses.map(e => ({
          id: e.id || crypto.randomUUID(),
          type: (e.type || 'expense') as any,
          category: e.category || 'Other',
          amount: parseFloat(e.amount) || 0,
          date: e.date ? new Date(e.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: e.description || e.name || e.title || 'Expense',
          paymentMethod: e.paymentMethod || 'Cash'
        }));
      }
    }

    if (foundAccounts.length === 0 && rootAccSnap && rootAccSnap.exists()) {
      foundAccounts = mapToArray(rootAccSnap.val());
    }

    if (foundCategories.length === 0 && rootCatSnap && rootCatSnap.exists()) {
      foundCategories = mapToArray(rootCatSnap.val());
    }

    if (foundBudgets.length === 0 && rootBudgetSnap && rootBudgetSnap.exists()) {
      foundBudgets = mapToArray(rootBudgetSnap.val());
    }
  } catch (err: any) {
    console.warn('Realtime Database read error:', err);
  }

  // 2. If Realtime Database returned nothing, check Firestore
  if (foundTransactions.length === 0 && foundAccounts.length === 0) {
    try {
      const db = getFirebaseDb();
      let [txSnap, accSnap, catSnap, bSnap, goalSnap] = await Promise.all([
        getDocs(collection(db, 'users', userId, 'transactions')),
        getDocs(collection(db, 'users', userId, 'accounts')),
        getDocs(collection(db, 'users', userId, 'categories')),
        getDocs(collection(db, 'users', userId, 'budgets')),
        getDocs(collection(db, 'users', userId, 'savings_goals')),
      ]);

      if (txSnap.empty && accSnap.empty) {
        try {
          const [rTx, rAcc, rCat, rB] = await Promise.all([
            getDocs(collection(db, 'transactions')),
            getDocs(collection(db, 'accounts')),
            getDocs(collection(db, 'categories')),
            getDocs(collection(db, 'budgets')),
          ]);
          if (!rTx.empty || !rAcc.empty) {
            txSnap = rTx;
            accSnap = rAcc;
            catSnap = rCat;
            bSnap = rB;
          }
        } catch {}
      }

      txSnap.forEach(d => foundTransactions.push({ ...(d.data() as Transaction), id: d.id }));
      accSnap.forEach(d => foundAccounts.push({ ...(d.data() as Account), id: d.id }));
      catSnap.forEach(d => foundCategories.push({ ...(d.data() as Category), id: d.id }));
      bSnap.forEach(d => foundBudgets.push({ ...(d.data() as Budget), id: d.id }));
    } catch (err: any) {
      console.warn('Firestore read error:', err);
    }
  }

  if (foundTransactions.length > 0 || foundAccounts.length > 0) {
    return {
      success: true,
      data: {
        transactions: foundTransactions,
        accounts: foundAccounts.length > 0 ? foundAccounts : undefined,
        categories: foundCategories.length > 0 ? foundCategories : undefined,
        budgets: foundBudgets.length > 0 ? foundBudgets : undefined,
        savingsGoals: foundGoals.length > 0 ? foundGoals : undefined,
      },
      message: `Retrieved ${foundTransactions.length} transactions and ${foundAccounts.length} accounts from your Firebase database!`
    };
  }

  return {
    success: true,
    data: {},
    message: 'Firebase database connected! (No prior records found at /transactions or /users. You can add transactions or click "Sync Local Data to Cloud".)'
  };
};

export const testFirebaseConnection = async (config: FirebaseConfig = USER_FIREBASE_CONFIG): Promise<{ success: boolean; message: string }> => {
  try {
    const { rtdb } = initFirebase(config);
    const dbRef = ref(rtdb);
    await get(child(dbRef, 'system_health')).catch(() => null);

    return {
      success: true,
      message: `Connected successfully to Firebase Realtime Database (${config.projectId})!`
    };
  } catch (error: any) {
    let msg = error.message || 'Connection failed.';
    return { success: false, message: msg };
  }
};
