import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import emailjs from '@emailjs/browser';
import { 
  CreditCard, 
  Send, 
  Plus, 
  LayoutDashboard, 
  User, 
  History, 
  Bell, 
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Zap,
  MoreHorizontal,
  Wallet,
  X,
  Maximize2,
  Flashlight,
  Plane,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Smartphone,
  Fingerprint,
  Lock
} from 'lucide-react';

// --- Types ---

interface Transaction {
  id: string;
  name: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  isPositive: boolean;
  status: 'BERHASIL' | 'PENDING' | 'GAGAL';
  method: string;
}

const CATEGORIES = [
  'Groceries', 
  'Utilities', 
  'Entertainment', 
  'Shopping', 
  'Transport', 
  'Food', 
  'Income', 
  'Other'
];

// --- Utils ---

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const generateID = () => Math.random().toString(36).substring(2, 15).toUpperCase();

// --- Components ---

const Notification = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 20, opacity: 1 }}
    exit={{ y: -50, opacity: 0 }}
    className="fixed top-0 inset-x-6 z-[100] bg-zinc-900/90 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
  >
    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
      <Bell className="text-white w-4 h-4" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-blue-400 font-bold uppercase tracking-tighter">System Alert</p>
      <p className="text-sm text-white font-medium">{message}</p>
    </div>
    <button onClick={onClose} className="text-zinc-500">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

const SplashScreen = ({ onComplete }: { onComplete: () => void, key?: string }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[100] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]" />
      
      <motion.div
        className="relative mb-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="w-28 h-28 bg-blue-600 rounded-[32px] flex items-center justify-center relative overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.5)] ring-1 ring-white/30">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative z-10">
            <Zap className="text-white w-14 h-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-2 italic uppercase">
          SUPER BANK <span className="text-blue-500 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]">EXPRESS</span>
        </h1>
        <div className="flex items-center gap-2 justify-center">
            <span className="h-1 w-8 bg-blue-500 rounded-full" />
            <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase font-bold">AI Core Active</p>
            <span className="h-1 w-8 bg-blue-500 rounded-full" />
        </div>
      </motion.div>

      <motion.div 
        className="mt-16 w-40 h-0.5 bg-zinc-900 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div 
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,1)]"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          onAnimationComplete={onComplete}
        />
      </motion.div>
    </motion.div>
  );
};

const QRISFlow = ({ onTransactionComplete, onClose }: { onTransactionComplete: (merchant: string, amount: number) => void, onClose: () => void }) => {
  const [step, setStep] = useState<'SCAN' | 'MERCHANT' | 'PROCESSING' | 'SUCCESS'>('SCAN');
  const [amount, setAmount] = useState('');
  const [merchant] = useState('Super Bank Express');
  const [trxId] = useState(generateID());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === 'SCAN') {
      let stream: MediaStream | null = null;
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
          // Simulate scan detection
          setTimeout(() => {
            setStep('MERCHANT');
            if (stream) stream.getTracks().forEach(t => t.stop());
          }, 3000);
        });
      return () => stream?.getTracks().forEach(t => t.stop());
    }
  }, [step]);

  const handlePay = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      onTransactionComplete(merchant, parseFloat(amount));
    }, 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black"
    >
      <AnimatePresence mode="wait">
        {step === 'SCAN' && (
          <motion.div key="scan" className="h-full flex flex-col">
             <div className="absolute top-12 inset-x-0 z-10 px-6 flex items-center justify-between">
                <button onClick={onClose} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white"><X /></button>
                <h2 className="text-white font-bold tracking-tight">QRIS SCANNER</h2>
                <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white"><Flashlight /></button>
             </div>
             <div className="flex-1 relative flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="relative w-64 h-64 border-2 border-white/20 rounded-[40px] overflow-hidden">
                   <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl" />
                   <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl" />
                   <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl" />
                   <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-3xl" />
                   <motion.div 
                     className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(37,99,235,1)]"
                     animate={{ top: ['0%', '100%'] }} 
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                   />
                </div>
             </div>
             <div className="bg-zinc-950 p-10 text-center pb-20">
                <p className="text-blue-400 font-bold text-sm tracking-widest uppercase mb-2 animate-pulse">Detecting QR Code...</p>
                <p className="text-zinc-500 text-xs">Align the code within the frame</p>
             </div>
          </motion.div>
        )}

        {step === 'MERCHANT' && (
          <motion.div key="merchant" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-full flex flex-col p-6 pt-20 bg-zinc-950">
             <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mb-4 shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                   <ShieldCheck className="text-white w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{merchant}</h2>
                <p className="text-zinc-500 text-sm font-medium">QRIS Berhasil Dibaca</p>
             </div>

             <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[40px] mb-10">
                <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-4">Input Nominal (IDR)</label>
                <div className="flex items-center gap-2">
                   <span className="text-2xl font-bold text-blue-500">Rp</span>
                   <input 
                     type="number" 
                     value={amount} 
                     onChange={(e) => setAmount(e.target.value)}
                     className="bg-transparent border-none outline-none text-4xl font-bold text-white w-full placeholder:text-zinc-800"
                     placeholder="0"
                     autoFocus
                   />
                </div>
             </div>

             <button 
               onClick={handlePay}
               disabled={!amount}
               className="w-full py-5 bg-blue-600 rounded-3xl text-white font-bold text-lg shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all disabled:opacity-30"
             >
               Bayar Sekarang
             </button>
             <button onClick={onClose} className="w-full py-5 text-zinc-500 font-bold mt-2">Batalkan</button>
          </motion.div>
        )}

        {step === 'PROCESSING' && (
          <motion.div key="processing" className="h-full flex flex-col items-center justify-center bg-zinc-950 p-10">
             <div className="relative mb-10">
                <motion.div 
                  className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-12 h-12 animate-pulse" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">AI Payment Processing</h2>
             <p className="text-zinc-500 text-center text-sm leading-relaxed">Securing your transaction with neural network encryption...</p>
          </motion.div>
        )}

        {step === 'SUCCESS' && (
          <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full bg-zinc-950 flex flex-col p-6 overflow-y-auto pb-10">
             <div className="flex flex-col items-center pt-10 mb-8">
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-emerald-500 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-emerald-500 italic tracking-tighter shadow-emerald-500/50 drop-shadow-md">TRANSAKSI BERHASIL</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">{merchant}</p>
             </div>

             <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50">
                   <p className="text-zinc-500 text-xs font-medium">Nominal</p>
                   <p className="text-white font-bold text-lg">{formatIDR(parseFloat(amount))}</p>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">ID Transaksi</p>
                      <p className="text-zinc-200 text-xs font-mono">{trxId}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">Tanggal</p>
                      <p className="text-zinc-200 text-xs">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">Waktu</p>
                      <p className="text-zinc-200 text-xs">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">Metode</p>
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">QRIS PAYMENT</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">Biaya Admin</p>
                      <p className="text-emerald-500 text-xs font-bold">Rp 0</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={onClose}
               className="w-full py-5 bg-zinc-900 border border-zinc-800 rounded-3xl text-white font-bold hover:bg-zinc-800 transition-colors"
             >
               Selesai
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main App Logic ---

type View = 'HOME' | 'WALLET' | 'HISTORY' | 'PROFILE';

const LoginScreen = ({ onLogin, isBiometricEnabled }: { onLogin: () => void, isBiometricEnabled: boolean, key?: string }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const triggerBiometric = () => {
    setIsAuthenticating(true);
    // Simulate biometric processing
    setTimeout(() => {
      setAuthSuccess(true);
      setTimeout(() => {
        onLogin();
      }, 800);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-zinc-950 z-[150] flex flex-col items-center justify-center px-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.15)_0%,transparent_70%)]" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
          <Zap className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-2">Welcome Back</h2>
        <p className="text-zinc-500 text-sm font-medium">Verify your identity to continue</p>
      </motion.div>

      <div className="w-full max-w-xs space-y-8 relative z-10">
        <div className="flex flex-col items-center justify-center gap-8">
          <motion.button
            onClick={triggerBiometric}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isAuthenticating}
            className="relative"
          >
            {/* Visual Ring */}
            <motion.div 
              className={`absolute -inset-4 border-2 rounded-full border-blue-500/30 ${isAuthenticating ? 'animate-ping' : ''}`}
            />
            
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${authSuccess ? 'bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)]' : isAuthenticating ? 'bg-blue-600' : 'bg-zinc-900 border border-zinc-800'}`}>
              <AnimatePresence mode="wait">
                {authSuccess ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <CheckCircle2 className="text-white w-10 h-10" />
                  </motion.div>
                ) : isAuthenticating ? (
                  <motion.div key="loader" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                    <Loader2 className="text-white w-10 h-10" />
                  </motion.div>
                ) : (
                  <motion.div key="icon" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <Fingerprint className="text-blue-500 w-10 h-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          <div className="text-center">
            <p className="text-white font-bold text-lg mb-1">
              {isAuthenticating ? 'Authenticating...' : authSuccess ? 'Identity Verified' : 'Tap to Login'}
            </p>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
              {isBiometricEnabled ? 'Face ID / Fingerprint Active' : 'Touch ID Required'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 pt-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={isAuthenticating ? { width: '100%' } : { width: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            </div>
          ))}
        </div>
      </div>

      <motion.button 
        className="mt-auto mb-12 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        whileHover={{ scale: 1.05 }}
      >
        Forgot Security PIN?
      </motion.button>
    </motion.div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('HOME');
  const [notification, setNotification] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  
  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('expres_auth') === 'true';
  });

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(() => {
    const saved = localStorage.getItem('expres_biometric');
    return saved === null ? true : saved === 'true';
  });

  // User Profile Persistence
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('expres_user');
    return saved ? JSON.parse(saved) : {
      name: 'Alex Sterling',
      email: 'alex.sterling@expres.ai',
      phone: '+62 812 3456 7890',
      avatar: null,
      accountId: 'ID-' + Math.floor(100000 + Math.random() * 900000),
    };
  });

  const [editForm, setEditForm] = useState({ ...user });

  // Security Logic (OTP)
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [userOTP, setUserOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  // Persistence
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('expres_balance_v2');
    return saved ? parseFloat(saved) : 200000000000;
  });

  const [history, setHistory] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('expres_history');
    return saved ? JSON.parse(saved) : [
      { id: 'TX001', name: 'Premium Coffee Co', type: 'Food', category: 'Food', amount: 45000, date: '10 Mei 2026', time: '08:42', isPositive: false, status: 'BERHASIL', method: 'Debit Card' },
      { id: 'TX002', name: 'Salary Deposit', type: 'Income', category: 'Income', amount: 15200000, date: '09 Mei 2026', time: '14:20', isPositive: true, status: 'BERHASIL', method: 'Transfer' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('expres_balance_v2', balance.toString());
    localStorage.setItem('expres_history', JSON.stringify(history));
    localStorage.setItem('expres_user', JSON.stringify(user));
    localStorage.setItem('expres_auth', isAuthenticated.toString());
    localStorage.setItem('expres_biometric', isBiometricEnabled.toString());
  }, [balance, history, user, isAuthenticated, isBiometricEnabled]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const monthSpending = history
      .filter(t => !t.isPositive)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalTransactions: history.length,
      monthlySpending: monthSpending,
      lastActivity: history[0]?.date || 'None'
    };
  }, [history]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Simulation Logic
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setNotification("Dana Masuk Rp 50.000 dari AI Network");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleQRISPayment = (merchant: string, amount: number) => {
    setBalance(prev => prev - amount);
    const newTrx: Transaction = {
      id: generateID(),
      name: merchant,
      type: 'Merchant Payment',
      category: 'Shopping',
      amount: amount,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isPositive: false,
      status: 'BERHASIL',
      method: 'QRIS'
    };
    setHistory(prev => [newTrx, ...prev]);
    setNotification(`Pembayaran Berhasil ke ${merchant}`);
  };

  const handleTransferComplete = (recipient: string, amount: number, method: string, category: string = 'Other') => {
    setBalance(prev => prev - amount);
    const newTrx: Transaction = {
      id: generateID(),
      name: recipient,
      type: 'Transfer',
      category: category,
      amount: amount,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isPositive: false,
      status: 'BERHASIL',
      method: method
    };
    setHistory(prev => [newTrx, ...prev]);
    setNotification(`Transfer ke ${recipient} Berhasil`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendVerification = async () => {
    if (!editForm.email) return;
    
    setIsSendingOTP(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);

    try {
      // Note: User must provide VITE_EMAILJS_PUBLIC_KEY in settings
      const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY;
      if (!publicKey) {
        console.warn("EmailJS Public Key is missing. Simulating output for development.");
        setOtpSent(true);
        setNotification(`[DEMO] OTP Sent to ${editForm.email}: ${otp}`);
        setIsSendingOTP(false);
        return;
      }

      await emailjs.send(
        'service_qsl1z9q', 
        'template_w79b4ju', 
        {
          to_email: editForm.email,
          otp_code: otp,
          user_name: editForm.name
        },
        publicKey
      );

      setOtpSent(true);
      setNotification("Kode OTP telah dikirim ke email baru Anda");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setNotification("Gagal mengirim OTP. Periksa konfigurasi EmailJS Anda.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyAndSave = () => {
    if (userOTP === generatedOTP || ((import.meta as any).env.DEV && userOTP === '000000')) {
      setUser(editForm);
      setShowEditProfile(false);
      setOtpSent(false);
      setGeneratedOTP(null);
      setUserOTP('');
      setNotification("Profil & Email Berhasil Diperbarui");
    } else {
      setNotification("Kode OTP Salah. Silakan coba lagi.");
    }
  };

  const saveProfile = () => {
    // If email hasn't changed, just save
    if (editForm.email === user.email) {
      setUser(editForm);
      setShowEditProfile(false);
      setNotification("Profile Berhasil Diperbarui");
    } else {
      // Trigger OTP flow if email changed
      handleSendVerification();
    }
  };

  const handleLogout = () => {
    setIsLoggedOut(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsLoggedOut(false);
      setIsAuthenticated(false);
      setActiveView('HOME');
      setShowLogoutConfirm(false);
    }, 2000);
  };

  // --- Sub-components for History ---

const TransferFlow = ({ onTransferComplete, onClose, balance }: { onTransferComplete: (recipient: string, amount: number, method: string, category: string) => void, onClose: () => void, balance: number }) => {
  const [step, setStep] = useState<'RECIPIENT' | 'AMOUNT' | 'PROCESSING' | 'SUCCESS'>('RECIPIENT');
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [notes, setNotes] = useState('');
  const [trxId] = useState(generateID());

  const handleNext = () => {
    if (step === 'RECIPIENT' && bank && accountNo) setStep('AMOUNT');
  };

  const handlePay = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || val > balance) return;
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      onTransferComplete(bank, val, 'Transfer', category);
    }, 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black"
    >
      <AnimatePresence mode="wait">
        {step === 'RECIPIENT' && (
          <motion.div key="recipient" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="h-full flex flex-col p-6 pt-20 bg-zinc-950">
             <div className="flex items-center gap-4 mb-10">
                <button onClick={onClose} className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-white"><X /></button>
                <h2 className="text-2xl font-black italic tracking-tighter text-white">RECIPIENT</h2>
             </div>

             <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Select Bank</label>
                  <select 
                    value={bank} 
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-white outline-none focus:border-blue-500/50 appearance-none"
                  >
                    <option value="">Pilih Bank Tujuan</option>
                    <option value="Super Bank Express">Super Bank Express</option>
                    <option value="BCA Digital">BCA Digital</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Account Number</label>
                  <input 
                    type="number" 
                    placeholder="Masukkan Nomor Rekening"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-white outline-none focus:border-blue-500/50 placeholder:text-zinc-800"
                  />
                </div>
             </div>

             <button 
               onClick={handleNext}
               disabled={!bank || !accountNo}
               className="w-full py-5 bg-blue-600 rounded-3xl text-white font-bold text-lg shadow-[0_15px_40px_rgba(37,99,235,0.3)] disabled:opacity-30 transition-all mb-10"
             >
               Lanjutkan
             </button>
          </motion.div>
        )}

        {step === 'AMOUNT' && (
          <motion.div key="amount" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="h-full flex flex-col p-6 pt-20 bg-zinc-950">
             <div className="flex items-center gap-4 mb-10">
                <button onClick={() => setStep('RECIPIENT')} className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-white"><ChevronRight className="rotate-180" /></button>
                <div>
                   <h2 className="text-xl font-bold text-white leading-tight">{bank}</h2>
                   <p className="text-zinc-500 text-xs font-mono">{accountNo}</p>
                </div>
             </div>

             <div className="space-y-8 flex-1">
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[40px]">
                   <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-4">Input Nominal (IDR)</label>
                   <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-500">Rp</span>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent border-none outline-none text-4xl font-bold text-white w-full placeholder:text-zinc-800"
                        placeholder="0"
                        autoFocus
                      />
                   </div>
                   <p className="text-zinc-600 text-[10px] mt-4">Sisa Saldo: <span className="text-zinc-400">{formatIDR(balance)}</span></p>
                </div>

                <div className="space-y-2">
                   <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-2">Category</label>
                   <select 
                     value={category} 
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-white outline-none focus:border-blue-500/50 appearance-none"
                   >
                     {CATEGORIES.map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                     ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-2">Catatan (Optional)</label>
                   <textarea 
                     value={notes} 
                     onChange={(e) => setNotes(e.target.value)}
                     placeholder="Tulis pesan transfer..."
                     className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-white outline-none focus:border-blue-500/50 placeholder:text-zinc-800 h-32 resize-none"
                   />
                </div>
             </div>

             <button 
               onClick={handlePay}
               disabled={!amount || parseFloat(amount) > balance || parseFloat(amount) <= 0}
               className="w-full py-5 bg-blue-600 rounded-3xl text-white font-bold text-lg shadow-[0_15px_40px_rgba(37,99,235,0.3)] disabled:opacity-30 transition-all mb-10"
             >
               Kirim Sekarang
             </button>
          </motion.div>
        )}

        {step === 'PROCESSING' && (
          <motion.div key="processing" className="h-full flex flex-col items-center justify-center bg-zinc-950 p-10">
             <div className="relative mb-10">
                <motion.div 
                  className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-12 h-12 animate-pulse" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Neural Transfer Protocol</h2>
             <p className="text-zinc-500 text-center text-sm leading-relaxed">Processing cross-network transaction with quantum security...</p>
          </motion.div>
        )}

        {step === 'SUCCESS' && (
          <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full bg-zinc-950 flex flex-col p-6 overflow-y-auto pb-10">
             <div className="flex flex-col items-center pt-10 mb-8">
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-emerald-500 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-emerald-500 italic tracking-tighter text-center">TRANSFER BERHASIL</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">{bank}</p>
             </div>

             <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50">
                   <p className="text-zinc-500 text-xs font-medium">Nominal</p>
                   <p className="text-white font-bold text-lg">{formatIDR(parseFloat(amount))}</p>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">Penerima</p>
                      <p className="text-zinc-200 text-xs font-bold">{bank}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">No Rekening</p>
                      <p className="text-zinc-200 text-xs font-mono">{accountNo}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">ID Transaksi</p>
                      <p className="text-zinc-200 text-xs font-mono">{trxId}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">Waktu</p>
                      <p className="text-zinc-200 text-xs">{new Date().toLocaleString('id-ID')}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-500 text-xs">Status</p>
                      <p className="text-emerald-500 text-xs font-black uppercase">BERHASIL</p>
                   </div>
                   {notes && (
                     <div className="pt-2 border-t border-zinc-800/50">
                        <p className="text-zinc-600 text-[10px] uppercase font-bold mb-1">Catatan</p>
                        <p className="text-zinc-400 text-xs italic">"{notes}"</p>
                     </div>
                   )}
                </div>
             </div>

             <button 
               onClick={onClose}
               className="w-full py-5 bg-zinc-900 border border-zinc-800 rounded-3xl text-white font-bold hover:bg-zinc-800 transition-colors"
             >
               Selesai
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Sub-components for History ---

  const HistoryPage = () => {
    const filteredHistory = useMemo(() => {
      return history.filter(t => {
        const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = activeFilter === 'Semua' || 
                            activeFilter === t.category ||
                            (activeFilter === 'Uang Masuk' && t.isPositive) ||
                            (activeFilter === 'Pengeluaran' && !t.isPositive) ||
                            (activeFilter === t.method) ||
                            (activeFilter === t.type);
        
        return matchesSearch && matchesFilter;
      });
    }, [searchTerm, activeFilter, history]);

    const dailyStats = useMemo(() => {
      const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const todayOutcome = history
        .filter(t => t.date === today && !t.isPositive)
        .reduce((acc, t) => acc + t.amount, 0);
      const totalIncome = history
        .filter(t => t.isPositive)
        .reduce((acc, t) => acc + t.amount, 0);
      
      return { todayOutcome, totalIncome, count: history.length };
    }, [history]);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col h-full bg-zinc-950 px-6 pb-40 overflow-hidden"
      >
        <div className="pt-4 mb-6">
           <h2 className="text-3xl font-black italic tracking-tighter text-white">HISTORY TRX</h2>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Neural Ledger v2.6</p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
           <div className="min-w-[140px] bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
              <p className="text-zinc-500 text-[8px] font-black uppercase mb-1">Today Out</p>
              <p className="text-red-500 font-black text-xs truncate">{formatIDR(dailyStats.todayOutcome)}</p>
           </div>
           <div className="min-w-[140px] bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
              <p className="text-zinc-500 text-[8px] font-black uppercase mb-1">Total In</p>
              <p className="text-emerald-500 font-black text-xs truncate">{formatIDR(dailyStats.totalIncome)}</p>
           </div>
           <div className="min-w-[100px] bg-blue-600/10 border border-blue-500/30 p-4 rounded-3xl">
              <p className="text-blue-400 text-[8px] font-black uppercase mb-1">Count</p>
              <p className="text-white font-black text-xs">{dailyStats.count} Trx</p>
           </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari merchant, ID, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <p className="text-zinc-600 text-[8px] font-black uppercase self-center mr-2">Categories:</p>
              {['Semua', ...CATEGORIES].map((f) => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${activeFilter === f ? 'bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800'}`}
                >
                  {f}
                </button>
              ))}
           </div>

           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <p className="text-zinc-600 text-[8px] font-black uppercase self-center mr-2">Quick Filters:</p>
              {['Uang Masuk', 'Pengeluaran', 'QRIS', 'Transfer', 'Top Up'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
           {filteredHistory.length > 0 ? filteredHistory.map((trx) => (
              <motion.button 
                key={trx.id}
                onClick={() => setSelectedTransaction(trx)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-[28px] hover:bg-zinc-900/60 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trx.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border border-white/5 shadow-inner`}>
                          {trx.isPositive ? <ArrowDownLeft className="w-5 h-5" /> : (trx.method === 'QRIS' ? <Plane className="w-5 h-5 rotate-[15deg]" /> : <ArrowUpRight className="w-5 h-5" />)}
                      </div>
                      <div>
                          <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{trx.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{trx.method} • {trx.time}</p>
                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                            <p className="text-blue-500/60 text-[9px] font-black uppercase tracking-tighter italic">{trx.category}</p>
                          </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black tracking-tight ${trx.isPositive ? 'text-emerald-500' : 'text-zinc-200'}`}>
                          {trx.isPositive ? '+' : '-'}{formatIDR(trx.amount)}
                      </p>
                      <p className="text-zinc-600 text-[9px] font-black uppercase">{trx.date.split(' 202')[0]}</p>
                    </div>
                </div>
              </motion.button>
           )) : (
             <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <Search className="w-12 h-12 mb-4" />
                <p className="font-bold text-sm">Tidak ada transaksi ditemukan</p>
             </div>
           )}
        </div>
      </motion.div>
    );
  };

  const TransactionDetailModal = ({ trx, onClose }: { trx: Transaction, onClose: () => void }) => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.9 }} 
        animate={{ y: 0, scale: 1 }}
        className="w-full max-w-sm bg-zinc-900 rounded-[48px] p-8 border border-zinc-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="text-center pt-4 mb-8">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${trx.isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              <CheckCircle2 className="w-10 h-10" />
           </div>
           <h3 className={`text-2xl font-black italic tracking-tighter ${trx.isPositive ? 'text-emerald-500' : 'text-white'}`}>
             {trx.isPositive ? 'DANA MASUK' : (trx.type === 'Transfer' ? 'TRANSFER BERHASIL' : 'PEMBAYARAN BERHASIL')}
           </h3>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{trx.name}</p>
        </div>

        <div className="bg-zinc-800/30 rounded-[32px] p-6 space-y-4 mb-8">
           <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50">
              <p className="text-zinc-500 text-[10px] font-black uppercase">Nominal</p>
              <p className={`font-black text-xl ${trx.isPositive ? 'text-emerald-500' : 'text-white'}`}>{formatIDR(trx.amount)}</p>
           </div>
           <div className="space-y-4">
              {[
                { label: 'Merchant', val: trx.name },
                { label: 'Category', val: trx.category, color: 'text-blue-400' },
                { label: 'Metode', val: trx.method },
                { label: 'Waktu', val: `${trx.date}, ${trx.time}` },
                { label: 'ID Transaksi', val: trx.id, mono: true },
                { label: 'Admin', val: 'Rp 0', color: 'text-emerald-500' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                   <p className="text-zinc-600 text-[10px] font-bold uppercase">{item.label}</p>
                   <p className={`text-xs font-bold ${item.mono ? 'font-mono' : ''} ${item.color || 'text-zinc-300'}`}>{item.val}</p>
                </div>
              ))}
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-zinc-950 border border-zinc-800 rounded-3xl text-white font-bold hover:bg-zinc-800 transition-colors"
        >
          Tutup Detail
        </button>
      </motion.div>
    </motion.div>
  );

  const ProfilePage = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 overflow-y-auto px-6 pb-40"
      >
        <div className="flex flex-col items-center pt-8 mb-10">
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-full border-4 border-blue-500/30 p-1 bg-gradient-to-tr from-blue-600 to-indigo-900 shadow-[0_0_30px_rgba(37,99,235,0.4)] cursor-pointer overflow-hidden"
            >
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User className="text-zinc-700 w-16 h-16" />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-blue-600/80 backdrop-blur-sm text-white text-[9px] font-black uppercase text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">Change</div>
            </motion.div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <motion.div 
              className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 border-4 border-zinc-950"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ShieldCheck className="w-4 h-4 text-white" />
            </motion.div>
          </div>
          
          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 mb-1">
               <h2 className="text-2xl font-black text-white italic">{user.name}</h2>
               <div className="bg-blue-500/10 border border-blue-500/30 rounded-full px-2 py-0.5">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Verified</p>
               </div>
            </div>
            <p className="text-zinc-500 text-sm font-medium">{user.email}</p>
            <p className="text-zinc-600 text-[10px] font-mono mt-1">{user.accountId}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-3xl text-center">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-1">Trx Total</p>
              <p className="text-white font-black text-lg">{stats.totalTransactions}</p>
           </div>
           <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-3xl text-center">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-1">Spent/Mo</p>
              <p className="text-blue-500 font-black text-xs truncate">{formatIDR(stats.monthlySpending).split(',')[0]}</p>
           </div>
           <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-3xl text-center">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-1">Last Act</p>
              <p className="text-white font-black text-[10px]">{stats.lastActivity.split(' ')[0]}</p>
           </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-6">
           <div className="space-y-3">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">General</p>
              <div className="space-y-2">
                 <button onClick={() => { setEditForm({ ...user }); setShowEditProfile(true); }} className="w-full flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-3xl hover:bg-zinc-900/60 transition-colors group">
                    <div className="flex items-center gap-4">
                       <User className="text-blue-500 w-5 h-5" />
                       <span className="text-white font-bold">Edit Profile</span>
                    </div>
                    <ChevronRight className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                 </button>
                 <button className="w-full flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-3xl hover:bg-zinc-900/60 transition-colors group">
                    <div className="flex items-center gap-4">
                       <Smartphone className="text-zinc-500 w-5 h-5" />
                       <span className="text-white font-bold">Account Settings</span>
                    </div>
                    <ChevronRight className="text-zinc-700" />
                 </button>
              </div>
           </div>

            <div className="space-y-3">
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Security</p>
               <div className="space-y-2">
                  <button 
                    onClick={() => setIsBiometricEnabled(!isBiometricEnabled)}
                    className="w-full flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-3xl hover:bg-zinc-900/60 transition-colors group"
                  >
                     <div className="flex items-center gap-4">
                        <Fingerprint className="text-blue-500 w-5 h-5" />
                        <span className="text-white font-bold">Biometric Authentication</span>
                     </div>
                     <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isBiometricEnabled ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                       <motion.div 
                        initial={false}
                        animate={{ x: isBiometricEnabled ? 20 : 4 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full" 
                       />
                     </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-3xl hover:bg-zinc-900/60 transition-colors group">
                     <div className="flex items-center gap-4">
                        <ShieldCheck className="text-emerald-500 w-5 h-5" />
                        <span className="text-white font-bold">AI Protection Mode</span>
                     </div>
                     <div className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                  </button>
               </div>
            </div>

           <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl active:scale-[0.98] transition-transform">
              <X className="text-red-500 w-5 h-5" />
              <span className="text-red-500 font-bold">Logout Securely</span>
           </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 overflow-hidden flex justify-center">
      <AnimatePresence>
        {loading && <SplashScreen key="splash" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && !isAuthenticated && (
          <LoginScreen 
            key="login" 
            onLogin={() => setIsAuthenticated(true)} 
            isBiometricEnabled={isBiometricEnabled}
          />
        )}
      </AnimatePresence>

      {/* Persistence Modals */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-6">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="w-full max-w-sm bg-zinc-900 rounded-[40px] p-8 border border-zinc-800 shadow-2xl">
               <h3 className="text-2xl font-black italic text-white mb-6">EDIT PROFILE</h3>
               
               <AnimatePresence mode="wait">
                 {!otpSent ? (
                   <motion.div 
                     key="edit-form"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="space-y-4 mb-8"
                   >
                      <div>
                        <label className="text-zinc-500 text-[10px] font-black uppercase mb-1 block">Full Name</label>
                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div>
                        <label className="text-zinc-500 text-[10px] font-black uppercase mb-1 block">Email Address</label>
                        <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors" placeholder="user@example.com" />
                      </div>
                      <div>
                        <label className="text-zinc-500 text-[10px] font-black uppercase mb-1 block">Phone Number</label>
                        <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-zinc-800/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { setShowEditProfile(false); setOtpSent(false); }} className="flex-1 py-4 bg-zinc-800 rounded-2xl font-bold">Cancel</button>
                        <button 
                          onClick={saveProfile} 
                          disabled={isSendingOTP}
                          className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold shadow-[0_10px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSendingOTP ? <Loader2 className="w-4 h-4 animate-spin" /> : (editForm.email !== user.email ? 'Kirim Verifikasi' : 'Save')}
                        </button>
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="otp-section"
                     id="otpSection"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="space-y-6 mb-8 text-center"
                   >
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="text-blue-500 w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">Verifikasi Email Anda</h4>
                        <p className="text-zinc-500 text-xs">Masukkan 6 digit kode yang kami kirim ke <span className="text-blue-400">{editForm.email}</span></p>
                      </div>
                      
                      <input 
                        id="otpInput"
                        type="text" 
                        maxLength={6}
                        value={userOTP}
                        onChange={e => setUserOTP(e.target.value)}
                        placeholder="••••••"
                        className="w-full bg-zinc-800 text-center text-4xl font-black tracking-[0.5em] py-5 rounded-3xl text-white outline-none border border-zinc-700 focus:border-blue-500 transition-all placeholder:text-zinc-700"
                      />

                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={handleVerifyAndSave}
                          className="w-full py-5 bg-blue-600 rounded-3xl font-black italic tracking-tighter text-white shadow-[0_15px_30px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-transform"
                        >
                          VERIFIKASI & SIMPAN
                        </button>
                        <button onClick={() => setOtpSent(false)} className="py-2 text-zinc-500 text-xs font-bold hover:text-white transition-colors">Ganti Email Salah?</button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div className="w-full max-w-xs bg-zinc-900 rounded-[40px] p-8 border border-zinc-800 shadow-2xl text-center">
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="text-red-500 w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Yakin ingin keluar?</h3>
               <p className="text-zinc-500 text-sm mb-8">Data transaksi dan saldo Anda akan tetap aman tersimpan.</p>
               <div className="flex flex-col gap-2">
                  <button onClick={handleLogout} className="w-full py-4 bg-red-500 rounded-2xl font-bold text-white">Logout</button>
                  <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 text-zinc-500 font-bold">Batal</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showScanner && (
          <QRISFlow 
            onClose={() => setShowScanner(false)} 
            onTransactionComplete={handleQRISPayment}
          />
        )}
        {showTransfer && (
          <TransferFlow 
            balance={balance}
            onClose={() => setShowTransfer(false)}
            onTransferComplete={handleTransferComplete}
          />
        )}
      </AnimatePresence>

      {!loading && isAuthenticated && (
        <motion.div 
          className="w-full max-w-md h-screen flex flex-col bg-zinc-950 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header */}
          <header className="p-6 flex items-center justify-between z-10">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative shadow-lg shadow-blue-500/10 overflow-hidden">
                   {user.avatar ? (
                     <img src={user.avatar} className="w-full h-full object-cover" alt="User" />
                   ) : (
                     <User className="text-blue-500 w-6 h-6" />
                   )}
                </div>
                <div>
                   <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">Premium Tier</p>
                   <p className="text-white font-bold text-lg leading-tight">{user.name.split(' ')[0]}</p>
                </div>
             </div>
             <div className="flex gap-2">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400"><Search className="w-5 h-5" /></div>
                <div className="relative w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-zinc-950" />
                </div>
             </div>
          </header>

          <AnimatePresence mode="wait">
            {activeView === 'HOME' && (
              <motion.main 
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto px-6 pb-32"
              >
                {/* Large Balance Display */}
                <section className="mb-8 pt-4">
                    <p className="text-zinc-500 text-sm font-semibold mb-1">Saldo Total</p>
                    <motion.h2 
                      key={balance}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-[44px] font-black tracking-tighter text-white leading-none mb-6"
                    >
                      {formatIDR(balance)}
                    </motion.h2>

                    {/* Digital ATM Card */}
                    <motion.div 
                      className="relative h-52 bg-gradient-to-br from-zinc-800/50 to-zinc-950 border border-zinc-800 rounded-[32px] p-8 overflow-hidden shadow-2xl group active:scale-[0.98] transition-transform"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-500/20 transition-colors" />
                      <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">EXPRES CORE</p>
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-3 h-3 text-zinc-500" />
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase truncate w-32">Titanium Digital Device</span>
                                </div>
                            </div>
                            <Zap className="text-blue-500 w-8 h-8 drop-shadow-[0_0_8px_rgba(37,99,235,1)]" />
                          </div>
                          <div className="space-y-4">
                            <div className="relative group">
                                <p className="font-mono text-2xl tracking-[0.3em] text-white/10 select-none">8820 4452 9001 7731</p>
                                <p className="absolute inset-0 font-mono text-2xl tracking-[0.3em] text-white blur-sm group-hover:blur-none transition-all duration-500">8820 4452 9001 7731</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Exp Date</p>
                                  <p className="text-zinc-200 text-sm font-bold">05/31</p>
                                </div>
                                <div className="flex -space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-red-600/80 backdrop-blur-sm" />
                                  <div className="w-10 h-10 rounded-full bg-yellow-500/80 backdrop-blur-sm" />
                                </div>
                            </div>
                          </div>
                      </div>
                    </motion.div>
                </section>

                {/* Action Grid */}
                <section className="grid grid-cols-4 gap-4 mb-10">
                    {[
                      { icon: Send, label: 'Transfer', color: 'bg-zinc-900', action: () => setShowTransfer(true) },
                      { icon: CreditCard, label: 'Bayar', color: 'bg-zinc-900', action: () => {} },
                      { icon: Plus, label: 'Top Up', color: 'bg-zinc-900', action: () => {} },
                      { icon: MoreHorizontal, label: 'Lainnya', color: 'bg-zinc-900', action: () => {} }
                    ].map((act, i) => (
                      <motion.button 
                        key={i}
                        whileHover={{ y: -4, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={act.action}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className={`w-full aspect-square rounded-[24px] ${act.color} border border-zinc-800 flex items-center justify-center shadow-lg shadow-black/20 hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all`}>
                          <act.icon className="text-zinc-400 group-hover:text-blue-500 w-6 h-6" />
                        </div>
                        <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{act.label}</span>
                      </motion.button>
                    ))}
                </section>

                {/* Recent Activity */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black italic tracking-tighter">RECENT ACTIVITY</h3>
                      <button onClick={() => setActiveView('HISTORY')} className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">VIEW ALL <ChevronRight className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-4">
                      {history.slice(0, 5).map((trx) => (
                          <motion.div 
                            key={trx.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            onClick={() => { setSelectedTransaction(trx); }}
                            className="flex items-center justify-between p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-[28px] hover:bg-zinc-900/60 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trx.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border border-white/5`}>
                                  {trx.isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div>
                                  <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{trx.name}</p>
                                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{trx.method} • {trx.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black tracking-tight ${trx.isPositive ? 'text-emerald-500' : 'text-zinc-200'}`}>
                                  {trx.isPositive ? '+' : '-'}{formatIDR(trx.amount)}
                                </p>
                                <p className="text-zinc-600 text-[9px] font-black uppercase">{trx.status}</p>
                            </div>
                          </motion.div>
                      ))}
                    </div>
                </section>
              </motion.main>
            )}

            {activeView === 'HISTORY' && (
              <HistoryPage key="history" />
            )}

            {activeView === 'PROFILE' && (
              <ProfilePage key="profile" />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedTransaction && (
              <TransactionDetailModal 
                trx={selectedTransaction} 
                onClose={() => setSelectedTransaction(null)} 
              />
            )}
          </AnimatePresence>

          {/* Bottom Nav */}
          <nav className="fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur-2xl border-t border-zinc-900 px-6 py-6 pb-12 flex justify-center z-50">
             <div className="max-w-md w-full flex items-center justify-between">
                {[
                  { icon: LayoutDashboard, label: 'Home', id: 'HOME' },
                  { icon: Wallet, label: 'Wallet', id: 'WALLET' }
                ].map((btn, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveView(btn.id as View)}
                    className={`flex flex-col items-center gap-1 ${activeView === btn.id ? 'text-blue-500' : 'text-zinc-600'} hover:text-zinc-400 transition-colors`}
                  >
                    <btn.icon className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{btn.label}</span>
                  </button>
                ))}

                <div className="relative -top-8">
                   <motion.button 
                     onClick={() => setShowScanner(true)}
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                     className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-[0_10px_40px_rgba(37,99,235,0.6)] ring-4 ring-zinc-950 group"
                   >
                     <Plane className="w-8 h-8 fill-current group-hover:rotate-[15deg] transition-transform" />
                     <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                   </motion.button>
                </div>

                {[
                  { icon: History, label: 'History', id: 'HISTORY' },
                  { icon: User, label: 'Profile', id: 'PROFILE' }
                ].map((btn, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveView(btn.id as View)}
                    className={`flex flex-col items-center gap-1 ${activeView === btn.id ? 'text-blue-500' : 'text-zinc-600'} hover:text-zinc-400 transition-colors`}
                  >
                    <btn.icon className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{btn.label}</span>
                  </button>
                ))}
             </div>
          </nav>

          {/* Logout Overlay */}
          <AnimatePresence>
            {isLoggedOut && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[300] bg-zinc-950 flex flex-col items-center justify-center"
              >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center mb-6"
                  >
                     <ShieldCheck className="text-blue-500 w-12 h-12" />
                  </motion.div>
                  <h2 className="text-white font-bold text-xl mb-2">Sesi Diamankan</h2>
                  <p className="text-zinc-500 text-sm">Menghapus data sesi Super Bank Express...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

