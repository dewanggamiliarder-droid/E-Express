import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
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
  WifiOff,
  X,
  Maximize2,
  Flashlight,
  Plane,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Smartphone,
  Fingerprint,
  Lock,
  CalendarDays
} from 'lucide-react';
import { GeminiChat } from './components/GeminiChat';

import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from 'qrcode.react';

// --- Error Boundary ---
class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <X className="text-red-500 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">SISTEM ERROR</h1>
          <p className="text-zinc-500 text-sm max-w-xs mb-8">Maaf, terjadi kesalahan pada aplikasi. Tim kami sedang memperbaikinya.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 rounded-2xl text-white font-bold"
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

// Firebase Imports
import { auth, db, OperationType, handleFirestoreError, googleProvider, signInWithRedirect, getRedirectResult, signInWithPopup, setPersistence, browserLocalPersistence } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  runTransaction,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

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
  createdAt: any;
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  category: string;
}

const EVENTS: Event[] = [
  { id: 'EV1', name: 'Annual Banking Summit', date: '15 Mei 2026', time: '10:00', category: 'Conference' },
  { id: 'EV2', name: 'Digital Security Workshop', date: '20 Mei 2026', time: '14:00', category: 'Workshop' },
  { id: 'EV3', name: 'VIP Networking Dinner', date: '25 Mei 2026', time: '19:00', category: 'Social' }
];

const DEFAULT_CATEGORIES = [
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

const BANK_LOGOS: { [key: string]: string } = {
  'BRI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/1280px-BANK_BRI_logo.svg.png',
  'BCA Digital': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/1024px-Bank_Central_Asia.svg.png',
  'Bank Mandiri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/1024px-Bank_Mandiri_logo_2016.svg.png',
  'BNI': 'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/1024px-BNI_logo.svg.png',
  'Super Bank Express': 'https://i.ibb.co/LzJ6FmP1/Blue-and-Red-Modern-Logistic-Service-Logo.png'
};

const getBankLogo = (name: string) => {
  if (!name) return null;
  const lowerName = name.toLowerCase();
  for (const key in BANK_LOGOS) {
    if (lowerName.includes(key.toLowerCase())) {
      return BANK_LOGOS[key];
    }
  }
  return null;
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
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
      >
        <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)] p-4">
          <img src={BANK_LOGOS['Super Bank Express']} className="w-full h-full object-contain" alt="Super Bank Logo" />
        </div>
      </motion.div>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">
          SUPER <br/> <span className="text-blue-500">BANK</span>
        </h1>
      </motion.div>

      <motion.div 
        className="mt-12 w-48 h-1 bg-zinc-900 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          onAnimationComplete={onComplete}
        />
      </motion.div>
    </motion.div>
  );
};

const QRISFlow = ({ onTransactionComplete, onClose }: { onTransactionComplete: (merchant: string, amount: number, recipientUid?: string) => void, onClose: () => void }) => {
  const [step, setStep] = useState<'SCAN' | 'MERCHANT' | 'PROCESSING' | 'SUCCESS'>('SCAN');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('Unknown Merchant');
  const [recipientUid, setRecipientUid] = useState<string | undefined>(undefined);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [trxId] = useState(generateID());
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const state = !isTorchOn;
        await scannerRef.current.applyVideoConstraints({
          // @ts-ignore
          advanced: [{ torch: state }]
        });
        setIsTorchOn(state);
      } catch (err) {
        console.warn("Torch not supported on this device", err);
      }
    }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanningFile(true);
    const html5QrCode = new Html5Qrcode("qris-reader-temp");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.error("Error scanning file", err);
      alert("Gagal membaca kode QR dari gambar.");
    } finally {
      setIsScanningFile(false);
      html5QrCode.clear();
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.type === 'SUPER_BANK_RECEIVE') {
        setMerchant(data.name || 'User Super Bank');
        setRecipientUid(data.uid);
      } else {
        setMerchant(decodedText);
      }
    } catch {
      setMerchant(decodedText);
    }
    
    setStep('MERCHANT');
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(err => console.error("Error stopping scanner", err));
    }
  };

  useEffect(() => {
    if (step === 'SCAN') {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const html5QrCode = new Html5Qrcode("qris-reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        handleScanSuccess,
        () => {}
      ).catch(err => {
        console.error("Unable to start scanner", err);
      });

      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(err => console.error("Cleanup error", err));
        }
      };
    }
  }, [step]);

  const handlePay = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      onTransactionComplete(merchant, parseFloat(amount), recipientUid);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {step === 'SCAN' && (
          <motion.div key="scan" className="h-full flex flex-col">
             {/* Header */}
             <div className="absolute top-12 inset-x-0 z-20 px-6 flex items-center justify-between pointer-events-auto">
                <button onClick={onClose} className="w-12 h-12 bg-zinc-900/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10"><X /></button>
                <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                   <h2 className="text-white font-bold tracking-tight text-xs uppercase tracking-widest">QRIS AI SCANNER</h2>
                </div>
                <button 
                  onClick={toggleTorch}
                  className={`w-12 h-12 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 transition-all ${isTorchOn ? 'bg-blue-500 text-white' : 'bg-zinc-900/80 text-white'}`}
                >
                  <Flashlight className={isTorchOn ? "fill-white" : ""} />
                </button>
             </div>
             
              {/* Camera Feed */}
             <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                <div id="qris-reader" className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
                <div id="qris-reader-temp" className="hidden" />
                
                {/* Advanced Scanner Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/40">
                  {/* The actual clear scanning area */}
                  <div className="relative w-72 h-72">
                    {/* Clearing the background for the scan area */}
                    <div className="absolute inset-0 bg-transparent shadow-[0_0_0_1000px_rgba(0,0,0,0.6)] rounded-3xl" />
                    
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-blue-500 rounded-tl-3xl z-20" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-blue-500 rounded-tr-3xl z-20" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-blue-500 rounded-bl-3xl z-20" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-blue-500 rounded-br-3xl z-20" />
                    
                    {/* Grid Effect */}
                    <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[1px] rounded-3xl overflow-hidden border border-white/10">
                       <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
                    </div>

                    {/* Scanning Laser */}
                    <motion.div 
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(37,99,235,1)] z-30"
                      animate={{ top: ['5%', '95%'] }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
                    />
                  </div>

                  <div className="mt-16 text-center max-w-[240px] relative z-20">
                     {isScanningFile ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                          <p className="text-white font-black text-[10px] tracking-widest uppercase">Processing Image...</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-2 mb-3">
                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                             <p className="text-blue-400 font-black text-[10px] tracking-[0.2em] uppercase">Neural Link Scanning</p>
                          </div>
                          <p className="text-zinc-400 text-[10px] leading-relaxed uppercase font-bold tracking-wider">Arahkan kamera ke kode QRIS untuk memproses pembayaran instan</p>
                        </>
                      )}
                  </div>
                </div>

                {/* Bottom Bar Controls */}
                <div className="absolute bottom-12 inset-x-0 px-10 flex items-center justify-center pointer-events-auto">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileScan}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                    >
                       <Smartphone className="w-6 h-6" />
                    </button>
                    <div className="mx-6 w-px h-10 bg-white/10" />
                    <button className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                       <Maximize2 className="w-6 h-6" />
                    </button>
                </div>
             </div>
          </motion.div>
        )}

        {step === 'MERCHANT' && (
          <motion.div key="merchant" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col p-6 bg-zinc-950 pt-20">
             <div className="flex flex-col items-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-[0_20px_50px_rgba(37,99,235,0.3)] border border-blue-400/20 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-white/20 animate-pulse group-hover:scale-150 transition-transform duration-1000" />
                   <ShieldCheck className="text-white w-12 h-12 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">{merchant}</h2>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                   <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase">Verified Super Merchant</p>
                </div>
             </div>

             <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] mb-12 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-center">Input Jumlah Pembayaran (IDR)</label>
                <div className="flex flex-col items-center gap-4">
                   <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-black text-blue-500 italic uppercase italic tracking-tighter">Rp</span>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent border-none outline-none text-6xl font-black text-white w-full placeholder:text-zinc-800 text-center tracking-tighter"
                        placeholder="0"
                        autoFocus
                      />
                   </div>
                   {amount && (
                      <p className="text-zinc-500 font-mono text-xs">
                        {formatIDR(parseFloat(amount))}
                      </p>
                   )}
                </div>
             </div>

             <div className="mt-auto space-y-4">
               <button 
                 onClick={handlePay}
                 disabled={!amount || parseFloat(amount) <= 0}
                 className="w-full py-6 bg-blue-600 rounded-[2rem] text-white font-black text-xl italic uppercase tracking-tighter shadow-[0_20px_60px_rgba(37,99,235,0.4)] transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
               >
                 Konfirmasi & Bayar
               </button>
               <button onClick={onClose} className="w-full py-4 text-zinc-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-zinc-400 transition-colors">Batalkan Pembayaran</button>
             </div>
          </motion.div>
        )}

        {step === 'PROCESSING' && (
          <motion.div key="processing" className="h-full flex flex-col items-center justify-center bg-zinc-950 p-10">
             <div className="relative mb-12">
                <motion.div 
                  className="w-40 h-40 border-2 border-dashed border-blue-500/20 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                   className="absolute inset-0 border-b-2 border-blue-500 rounded-full"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Fingerprint className="text-blue-500 w-16 h-16 animate-pulse" />
                </div>
             </div>
             <div className="text-center">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-3">AI Processing</h2>
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest leading-relaxed">
                  Securing neural transaction through <br/> Super Bank Quantum Gateway...
                </p>
             </div>
          </motion.div>
        )}

        {step === 'SUCCESS' && (
          <motion.div key="success" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-full bg-zinc-950 flex flex-col p-6 overflow-y-auto pb-10">
             <div className="flex flex-col items-center pt-14 mb-10">
                <div className="relative mb-6">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
                   >
                     <CheckCircle2 className="text-white w-12 h-12" />
                   </motion.div>
                   <motion.div 
                     className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full -z-10"
                     animate={{ opacity: [0.5, 1, 0.5] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   />
                </div>
                <h2 className="text-4xl font-black text-emerald-500 italic tracking-tighter uppercase">SUCCESSFUL</h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">{merchant}</p>
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 space-y-6 mb-10">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Amount Settled</p>
                   <p className="text-white font-black text-2xl italic tracking-tighter">{formatIDR(parseFloat(amount))}</p>
                </div>
                <div className="space-y-4 pt-2">
                   <div className="flex justify-between">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Transaction ID</p>
                      <p className="text-zinc-300 text-[10px] font-mono tracking-tighter">{trxId}</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Network Node</p>
                      <p className="text-zinc-300 text-[10px] uppercase font-black italic">Super-HQ-01</p>
                   </div>
                   <div className="flex justify-between">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Timestamp</p>
                      <p className="text-zinc-300 text-[10px] font-black">{new Date().toLocaleString('id-ID')}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Protocol</p>
                      <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                         <p className="text-blue-500 text-[8px] font-black uppercase tracking-[0.2em]">QRIS Dynamic AI</p>
                      </div>
                   </div>
                </div>
             </div>

             <button 
               onClick={onClose}
               className="w-full py-6 bg-zinc-800 border border-zinc-700 rounded-[2rem] text-white font-black italic uppercase tracking-tighter hover:bg-zinc-700 transition-all active:scale-95"
             >
               Back to Terminal
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main App Logic ---

type View = 'HOME' | 'WALLET' | 'HISTORY' | 'PROFILE';


const HandHoldingPhone = () => {
  return (
    <div className="relative w-full h-[320px] flex items-center justify-center pointer-events-none mb-10">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
      
      {/* Hand & Phone Group */}
      <motion.div 
        className="relative z-10"
        initial={{ y: 50, opacity: 0, rotate: -5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
      >
        {/* The Phone */}
        <motion.div 
          className="relative w-40 h-72 bg-zinc-900 rounded-[2.5rem] border-[6px] border-zinc-800 shadow-2xl overflow-hidden z-20"
          animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Internal Screen */}
          <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 gap-4">
             <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center p-2">
                <img src={BANK_LOGOS['Super Bank Express']} className="w-full h-full object-contain" alt="Logo" />
             </div>
             <div className="space-y-1.5 text-center">
                <div className="h-2 w-16 bg-zinc-100 rounded-full mx-auto" />
                <div className="h-1.5 w-10 bg-zinc-50 rounded-full mx-auto" />
             </div>
          </div>
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 flex items-center justify-center">
             <div className="w-14 h-2.5 bg-black rounded-full mt-1.5" />
          </div>
        </motion.div>

        {/* Hand Shadow (Simplified Abstract) */}
        <motion.div 
          className="absolute -bottom-10 left-1/2 -translate-x-1/3 w-56 h-56 z-10 opacity-60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute bottom-0 right-0 w-28 h-56 bg-zinc-900/40 rounded-t-[80px] rotate-[15deg] blur-md" />
        </motion.div>
      </motion.div>
    </div>
  );
};

const LoginScreen = ({ onLogin }: { onLogin: () => void, key?: string }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = async () => {
    // Determine if we are in an environment that blocks redirects (like AI Studio iframe)
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      alert("Fitur login Google tidak didukung di dalam frame pratinjau ini.\n\nSilakan klik tombol 'Open in new tab' di pojok kanan atas aplikasi Anda untuk masuk.");
      return;
    }

    if (isAuthenticating) return;

    setIsAuthenticating(true);
    try {
        console.log("Initiating Google Login Redirect...");
        
        // Ensure standard persistence first
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch (pErr) {
          console.warn("Persistence set failed, continuing anyway", pErr);
        }

        await signInWithRedirect(auth, googleProvider);
        // After redirecting, the browser leaves the page
    } catch (error: any) {
        console.error("Auth Exception:", error);
        setIsAuthenticating(false);
        
        let errorMsg = error.message || "Terjadi kesalahan saat memulai login.";
        
        if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized')) {
          errorMsg = `DOMAIN TIDAK TERDAFTAR!\n\n` +
                     `Host '${window.location.hostname}' belum terdaftar di Firebase Authorized Domains.\n\n` +
                     `Harap tambahkan domain ini di Firebase Console Anda.`;
        } else if (error.code === 'auth/network-request-failed') {
          errorMsg = "Koneksi terputus. Harap cek internet Anda.";
        }
        
        alert(errorMsg);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-zinc-950 z-[150] flex flex-col items-center justify-center px-8 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="text-center relative z-10 w-full max-w-xs flex flex-col items-center">
        <HandHoldingPhone />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">
              SUPER <span className="text-blue-500">BANK</span>
          </h2>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">Digital Banking Redefined</p>
        </motion.div>
      </div>

      <div className="w-full max-w-xs space-y-4 relative z-10">
        <button 
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="w-full py-5 bg-white rounded-3xl text-zinc-950 font-black flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
            {isAuthenticating ? (
                <Loader2 className="animate-spin" />
            ) : (
                <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </>
            )}
        </button>
        
        <p className="text-center text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 pt-2">
            Licensed & Monitored by AI-Banking Authority
        </p>
        
        <div className="mt-8 flex justify-center">
          <a href="https://ibb.co.com/SD6Z1dmD" target="_blank" rel="noopener noreferrer">
            <img src="https://i.ibb.co/0pnzWF9p/tugas-OJK1-1.jpg" alt="tugas-OJK1-1" border="0" className="w-[100px] rounded-lg opacity-30 hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const ReceiveQRModal = ({ user, onClose }: { user: any, onClose: () => void }) => {
  const qrData = JSON.stringify({
    type: 'SUPER_BANK_RECEIVE',
    uid: user.uid,
    name: user.name,
    accountId: user.accountId
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-zinc-900 border border-white/5 rounded-[3rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 inset-x-0 h-[200px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-2xl relative z-10 p-2">
             <img src={BANK_LOGOS['Super Bank Express']} className="w-full h-full object-contain" alt="Logo" />
          </div>
          
          <div className="relative z-10 mb-8 p-6 bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl m-[-2px]" />
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl m-[-2px]" />
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl m-[-2px]" />
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl m-[-2px]" />
             
             <QRCodeSVG 
               value={qrData} 
               size={220}
               level="H"
               includeMargin={false}
               imageSettings={{
                 src: BANK_LOGOS['Super Bank Express'],
                 x: undefined,
                 y: undefined,
                 height: 48,
                 width: 48,
                 excavate: true,
               }}
             />
          </div>
          
          <div className="text-center mb-8 relative z-10 w-full">
             <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">{user.name}</h2>
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <p className="text-blue-500 font-black text-xs tracking-[0.2em] uppercase">{user.accountId}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3 py-4 border-t border-white/5 w-full justify-center">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em]">Ready for instant transfer</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center">
           <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.4em] mb-10 text-center">
              Scan with another <br/> Super Bank app
           </p>
           
           <button 
             onClick={onClose}
             className="w-full py-6 bg-zinc-800 border border-zinc-700 rounded-[2rem] text-white font-black italic uppercase tracking-tighter shadow-xl active:scale-95 transition-all"
           >
             Close Terminal
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Connection listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative">
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed top-0 inset-x-0 z-[2000] bg-zinc-950/80 backdrop-blur-md border-b border-white/5 p-2 text-center"
            >
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                <WifiOff className="w-3 h-3 text-zinc-600" />
                Offline Mode • Quantum Cache Active
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <MainApp isOffline={isOffline} />
      </div>
    </ErrorBoundary>
  );
}

function MainApp({ isOffline }: { isOffline: boolean }) {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('HOME');
  const [notification, setNotification] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  
  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  
  // Auth & Firebase State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasShownSplash, setHasShownSplash] = useState(false);
  const isFirstTransLoad = useRef(true);

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(() => {
    const saved = localStorage.getItem('expres_biometric');
    return saved === null ? true : saved === 'true';
  });

  // User Profile from Firestore
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    accountId: string;
  }>({
    name: 'Loading...',
    email: '',
    phone: '',
    avatar: null,
    accountId: '...',
  });

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [editForm, setEditForm] = useState({ ...user });

  // Security Logic (OTP)
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [userOTP, setUserOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('expres_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Firebase Auth Observer
  useEffect(() => {
    // Validate Env Vars on Startup
    const keys = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID'
    ];
    const missing = keys.filter(k => !import.meta.env[k]);
    if (missing.length > 0) {
      console.error("Missing critical Firebase environment variables:", missing);
      setNotification(`SYSTEM: Konfigurasi Firebase tidak lengkap (${missing.join(', ')})`);
    }

    const handleRedirect = async () => {
      // Don't show heavy global loader immediately for every reload
      // only if we detect a likely redirect flow
      const isLikelyRedirect = window.location.search.includes('code=') || 
                               window.location.search.includes('state=') || 
                               window.localStorage.getItem('firebase:previous_auth_op');
      
      if (isLikelyRedirect) {
        setLoading(true);
      }

      // Safety timer: stop loading if stuck
      const loadingTimer = setTimeout(() => {
        setLoading(false);
      }, 7000);

      try {
        console.log("Checking for Google redirect results...");
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          console.log("Login successful via Redirect:", result.user.email);
        } else {
          // If no result and no user, we can safely stop loading
          if (!auth.currentUser) {
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error("Redirect Flow Error Detail:", err);
        setLoading(false);
        
        if (err.code === 'auth/web-storage-unsupported') {
           alert("Storage browser tidak dapat diakses. Harap gunakan Chrome versi terbaru dan nonaktifkan 'Block third-party cookies'.");
        } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized')) {
           alert("DOMAIN BELUM TERDAFTAR:\nHarap tambahkan '" + window.location.hostname + "' ke 'Authorized Domains' di Firebase Console.");
        } else if (err.message?.includes('initial state is missing')) {
           console.warn("Status session tidak ditemukan. Menunggu Auth Observer...");
        } else {
           setNotification(`Gagal Login: ${err.message}`);
        }
      } finally {
        clearTimeout(loadingTimer);
      }
    };
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        console.log("Auth State Changed: User Logged In", fUser.email);
        
        // Cache management
        const cachedProfile = localStorage.getItem(`super_bank_profile_${fUser.uid}`);
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile);
            setUser(profile.user);
            setBalance(profile.balance);
          } catch (e) {
            console.error("Cache parse error", e);
          }
        }

        // Ensure Profile exists in Firestore
        const ensureProfile = async (retries = 3) => {
          try {
            const userDocRef = doc(db, 'users', fUser.uid);
            const userSnap = await getDoc(userDocRef);
            
            if (!userSnap.exists()) {
              console.log("Initializing dynamic profile for first-time session...");
              const newAccountId = 'SB-' + Math.floor(10000000 + Math.random() * 90000000);
              
              await setDoc(userDocRef, {
                  uid: fUser.uid,
                  email: fUser.email,
                  name: fUser.displayName || fUser.email?.split('@')[0] || 'Member',
                  displayName: fUser.displayName || 'Member',
                  photoURL: fUser.photoURL || null,
                  avatar: fUser.photoURL || null,
                  balance: 25000000, 
                  accountId: newAccountId,
                  createdAt: serverTimestamp(),
                  lastLogin: serverTimestamp()
              });
              
              console.log("New profile created successfully.");
            } else {
              // Update last login
              await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
              // Sync state from firestore
              const data = userSnap.data();
              if (data) {
                setUser({
                  name: data.name || 'Member',
                  email: data.email || '',
                  accountId: data.accountId || '',
                  avatar: data.avatar || null
                });
                setBalance(data.balance || 0);
              }
            }
            setIsAuthenticated(true);
            setLoading(false);
          } catch (err: any) {
            console.error("Ensuring profile failed:", err);
            if (err.message.includes('offline') && retries > 0) {
              setTimeout(() => ensureProfile(retries - 1), 2000);
            } else {
              setNotification("Sinkronisasi profil gagal. Menggunakan data lokal.");
              setIsAuthenticated(true); // Allow limited session
              setLoading(false);
            }
          }
        };
        ensureProfile();
      } else {
        console.log("Auth State Changed: User Logged Out");
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Data Synchronization Listener
  useEffect(() => {
    if (!firebaseUser?.uid || !isAuthenticated) {
      isFirstTransLoad.current = true;
      return;
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile = {
          name: data.name || 'User',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar || null,
          accountId: data.accountId || '',
        };
        setUser(profile);
        setBalance(data.balance || 0);

        // Cache to local storage
        localStorage.setItem(`super_bank_profile_${firebaseUser.uid}`, JSON.stringify({
          user: profile,
          balance: data.balance || 0,
          timestamp: Date.now()
        }));
      }
    }, (err) => {
        if (!err.message.includes('permission')) {
            console.error(`UserSync Error:`, err);
        }
    });

    const transCollectionRef = collection(db, 'users', firebaseUser.uid, 'transactions');
    const q = query(transCollectionRef, orderBy('createdAt', 'desc'), limit(100));
    const unsubTrans = onSnapshot(q, (querySnap) => {
      // Process doc changes for notifications
      querySnap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const d = change.doc.data();
          // Trigger notification for new incoming SUCCESSFUL transactions, bypassing the initial load
          if (!isFirstTransLoad.current && d.isPositive && d.status === 'BERHASIL') {
            const amountStr = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(d.amount);
            setNotification(`Uang Masuk: ${amountStr} dari ${d.name || 'External Account'}`);
          }
        }
      });
      
      isFirstTransLoad.current = false;

      const trans: Transaction[] = [];
      querySnap.forEach((doc) => {
        const d = doc.data();
        trans.push({
          id: doc.id,
          name: d.name,
          type: d.type,
          category: d.category,
          amount: d.amount,
          date: d.date,
          time: d.time,
          isPositive: d.isPositive,
          status: d.status,
          method: d.method,
          createdAt: d.createdAt,
        });
      });
      setHistory(trans);
      
      // Cache history for offline access
      if (firebaseUser?.uid) {
        localStorage.setItem(`super_bank_history_${firebaseUser.uid}`, JSON.stringify(trans));
      }
    }, (err) => {
        if (!err.message.includes('permission')) {
            console.error(`TransSync Error:`, err);
        }
    });

    return () => {
      unsubUser();
      unsubTrans();
    };
  }, [firebaseUser?.uid, isAuthenticated]);

  useEffect(() => {
    setEditForm({ ...user });
  }, [user]);

  useEffect(() => {
    localStorage.setItem('expres_biometric', isBiometricEnabled.toString());
    localStorage.setItem('expres_categories', JSON.stringify(customCategories));
  }, [isBiometricEnabled, customCategories]);

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
      // Simulation removed
    }
  }, [loading]);

  const handleQRISPayment = async (merchant: string, amount: number, recipientUid?: string) => {
    if (!firebaseUser) return;
    try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const transRef = doc(collection(db, 'users', firebaseUser.uid, 'transactions'));
        
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) throw new Error("User not found");
            const senderData = userSnap.data();
            const newBal = senderData.balance - amount;
            if (newBal < 0) throw new Error("Saldo tidak cukup");

            // If it's a transfer to another user
            if (recipientUid) {
                if (recipientUid === firebaseUser.uid) throw new Error("Tidak bisa transfer ke diri sendiri");
                
                const receiverRef = doc(db, 'users', recipientUid);
                const receiverSnap = await transaction.get(receiverRef);
                if (!receiverSnap.exists()) throw new Error("Penerima tidak ditemukan");
                
                const receiverData = receiverSnap.data();
                const receiverTransRef = doc(collection(db, 'users', recipientUid, 'transactions'));
                
                // Update Sender
                transaction.update(userRef, { balance: newBal });
                transaction.set(transRef, {
                    name: merchant,
                    type: 'Transfer Out (QRIS)',
                    category: 'Transfer',
                    amount: amount,
                    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    isPositive: false,
                    status: 'BERHASIL',
                    method: 'QRIS',
                    recipientId: recipientUid,
                    createdAt: serverTimestamp()
                });
                
                // Update Receiver
                transaction.update(receiverRef, { balance: receiverData.balance + amount });
                transaction.set(receiverTransRef, {
                    name: senderData.name || 'Anonymous User',
                    type: 'Transfer In (QRIS)',
                    category: 'Income',
                    amount: amount,
                    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    isPositive: true,
                    status: 'BERHASIL',
                    method: 'QRIS',
                    senderId: firebaseUser.uid,
                    createdAt: serverTimestamp()
                });
            } else {
                // Generic Merchant Payment
                transaction.update(userRef, { balance: newBal });
                transaction.set(transRef, {
                    name: merchant,
                    type: 'Merchant Payment',
                    category: 'Shopping',
                    amount: amount,
                    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    isPositive: false,
                    status: 'BERHASIL',
                    method: 'QRIS',
                    createdAt: serverTimestamp()
                });
            }
        });
        setNotification(`Pembayaran Berhasil ke ${merchant}`);
    } catch (err: any) {
        console.error(err);
        setNotification(err.message || "Gagal memproses pembayaran QRIS.");
    }
  };

  const handleTransferComplete = async (recipient: string, amount: number, method: string, category: string = 'Other', accountNo?: string) => {
    if (!firebaseUser) return;
    try {
        const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // 1. Check if recipient is a Super Bank account
        const isSuperBank = accountNo?.startsWith('SB-');
        
        let recipientUid = null;
        let recipientData = null;

        if (isSuperBank) {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('accountId', '==', accountNo), limit(1));
            const querySnap = await getDocs(q);
            
            if (!querySnap.empty) {
                recipientUid = querySnap.docs[0].id;
                recipientData = querySnap.docs[0].data();
            }
        }

        const senderRef = doc(db, 'users', firebaseUser.uid);
        const senderTransRef = doc(collection(db, 'users', firebaseUser.uid, 'transactions'));

        await runTransaction(db, async (transaction) => {
            // 1. ALL READS FIRST
            const senderSnap = await transaction.get(senderRef);
            let receiverSnap = null;
            if (recipientUid) {
                const receiverRef = doc(db, 'users', recipientUid);
                receiverSnap = await transaction.get(receiverRef);
            }

            // 2. VALIDATIONS
            if (!senderSnap.exists()) throw new Error("Data user error");
            
            const newSenderBal = senderSnap.data().balance - amount;
            if (newSenderBal < 0) throw new Error("Saldo anda tidak cukup");

            // 3. ALL WRITES AFTER
            transaction.update(senderRef, { balance: newSenderBal });

            transaction.set(senderTransRef, {
                id: senderTransRef.id,
                name: `Transfer ke ${recipientData ? recipientData.name : recipient} (${accountNo})`,
                type: 'Transfer',
                category: category,
                amount: amount,
                date: dateStr,
                time: timeStr,
                isPositive: false,
                status: 'BERHASIL',
                method: method,
                senderUid: firebaseUser.uid,
                recipientUid: recipientUid || 'EXTERNAL',
                createdAt: serverTimestamp()
            });

            if (recipientUid && receiverSnap?.exists()) {
                const receiverRef = doc(db, 'users', recipientUid);
                const receiverTransRef = doc(collection(db, 'users', recipientUid, 'transactions'));
                
                const newReceiverBal = (receiverSnap.data().balance || 0) + amount;
                transaction.update(receiverRef, { balance: newReceiverBal });
                
                transaction.set(receiverTransRef, {
                    id: receiverTransRef.id,
                    name: `Transfer dari ${user.name}`,
                    type: 'Transfer',
                    category: category,
                    amount: amount,
                    date: dateStr,
                    time: timeStr,
                    isPositive: true,
                    status: 'BERHASIL',
                    method: method,
                    senderUid: firebaseUser.uid,
                    recipientUid: recipientUid,
                    createdAt: serverTimestamp()
                });
            }
        });

        setNotification(`Transfer ke ${recipientData ? recipientData.name : recipient} (${accountNo}) Berhasil.`);
    } catch (err) {
        console.error("Transfer Error:", err);
        setNotification("Gagal memproses transfer. Silakan cek saldo atau nomor rekening.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && firebaseUser) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const avatarStr = reader.result as string;
        try {
            await updateDoc(doc(db, 'users', firebaseUser.uid), { avatar: avatarStr });
            setUser(prev => ({ ...prev, avatar: avatarStr }));
        } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
        }
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

  const handleLogout = async () => {
    setIsLoggedOut(true);
    setLoading(true);
    try {
        await signOut(auth);
        setTimeout(() => {
          setLoading(false);
          setIsLoggedOut(false);
          setIsAuthenticated(false);
          setFirebaseUser(null);
          setUser({
            name: 'Alex Sterling',
            email: 'alex.sterling@expres.ai',
            phone: '+62 812 3456 7890',
            avatar: null,
            accountId: 'ID-' + Math.floor(100000 + Math.random() * 900000),
          });
          setBalance(0);
          setHistory([]);
          setActiveView('HOME');
          setShowLogoutConfirm(false);
        }, 1500);
    } catch (e) {
        console.error("Logout error", e);
        setLoading(false);
    }
  };

  // --- Sub-components for History ---

const TransferFlow = ({ onTransferComplete, onClose, balance, categories }: { onTransferComplete: (recipient: string, amount: number, method: string, category: string, accNo: string) => void, onClose: () => void, balance: number, categories: string[] }) => {
  const [step, setStep] = useState<'RECIPIENT' | 'AMOUNT' | 'PROCESSING' | 'SUCCESS'>('RECIPIENT');
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Other');
  const [notes, setNotes] = useState('');
  const [trxId] = useState(generateID());
  const [isValidatingAcc, setIsValidatingAcc] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isScanning) {
      const html5QrCode = new Html5Qrcode("transfer-scanner");
      scannerRef.current = html5QrCode;
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.type === 'SUPER_BANK_RECEIVE') {
              setBank('Super Bank Express');
              setAccountNo(data.accountId);
              setRecipientName(data.name);
              setIsScanning(false);
              html5QrCode.stop();
            } else {
              setAccountNo(decodedText);
              setIsScanning(false);
              html5QrCode.stop();
            }
          } catch {
            setAccountNo(decodedText);
            setIsScanning(false);
            html5QrCode.stop();
          }
        },
        () => {}
      ).catch(err => console.error("Scanner error", err));

      return () => {
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop();
        }
      };
    }
  }, [isScanning]);

  const handleNext = async () => {
    if (step === 'RECIPIENT' && bank && accountNo) {
        setIsValidatingAcc(true);
        try {
            let finalAccNo = accountNo.trim().toUpperCase();
            
            // For now, only Super Bank accounts are validated against Firestore
            if (bank === 'Super Bank Express') {
                // Automatically add SB- prefix if missing
                if (!finalAccNo.startsWith('SB-')) {
                    finalAccNo = 'SB-' + finalAccNo;
                }

                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('accountId', '==', finalAccNo), limit(1));
                const querySnap = await getDocs(q);
                
                if (querySnap.empty) {
                    alert(`Nomor rekening ${finalAccNo} tidak ditemukan di Super Bank.`);
                } else if (querySnap.docs[0].id === (firebaseUser?.uid || '')) {
                    alert("Anda tidak dapat mentransfer ke diri sendiri.");
                } else {
                    setAccountNo(finalAccNo);
                    setRecipientName(querySnap.docs[0].data().name);
                    setStep('AMOUNT');
                }
            } else {
                // Other banks - allow dummy flow for demo
                setAccountNo(finalAccNo);
                setRecipientName(`Nasabah ${bank}`);
                setStep('AMOUNT');
            }
        } catch (e: any) {
            console.error("Validation Error:", e);
            if (e.message?.includes('permission')) {
                alert("Kesalahan Izin: Pastikan Anda sudah login.");
            } else {
                alert("Terjadi kesalahan saat validasi rekening.");
            }
        } finally {
            setIsValidatingAcc(false);
        }
    }
  };

  const handlePay = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || val > balance) return;
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      onTransferComplete(bank, val, 'Transfer', category, accountNo);
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
                <div className="space-y-3">
                  <label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Select Bank</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(BANK_LOGOS).map(bankName => (
                      <button
                        key={bankName}
                        onClick={() => setBank(bankName)}
                        className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all ${bank === bankName ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-zinc-900 border-zinc-800'}`}
                      >
                        <div className="w-12 h-8 flex items-center justify-center p-1 bg-white rounded-lg">
                           <img src={BANK_LOGOS[bankName]} className="max-w-full max-h-full object-contain" alt={bankName} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${bank === bankName ? 'text-blue-500' : 'text-zinc-500'}`}>{bankName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Account Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Contoh: SB-12345678"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value.toUpperCase())}
                      className="flex-1 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-white outline-none focus:border-blue-500/50 placeholder:text-zinc-800 uppercase"
                    />
                    <button 
                      onClick={() => setIsScanning(true)}
                      className="w-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"
                    >
                      <Maximize2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      key="scanner-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[200] bg-black flex flex-col"
                    >
                       <div className="absolute top-12 inset-x-6 z-10 flex justify-between items-center">
                          <button onClick={() => setIsScanning(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white"><X /></button>
                          <h3 className="text-white font-black italic">SCAN RECEIVER</h3>
                          <div className="w-12" />
                       </div>
                       <div id="transfer-scanner" className="flex-1" />
                       <div className="p-10 text-center bg-zinc-950">
                          <p className="text-blue-500 font-bold mb-1">Scan QR Code Penerima</p>
                          <p className="text-zinc-500 text-xs">Posisikan kode di dalam kotak pemindai</p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <button 
               onClick={handleNext}
               disabled={!bank || !accountNo || isValidatingAcc}
               className="w-full py-5 bg-blue-600 rounded-3xl text-white font-bold text-lg shadow-[0_15px_40px_rgba(37,99,235,0.3)] disabled:opacity-30 transition-all mb-10 flex items-center justify-center gap-2"
             >
               {isValidatingAcc ? <Loader2 className="animate-spin" /> : 'Lanjutkan'}
             </button>
          </motion.div>
        )}

        {step === 'AMOUNT' && (
          <motion.div key="amount" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="h-full flex flex-col p-6 pt-20 bg-zinc-950">
             <div className="flex items-center gap-4 mb-10">
                <button onClick={() => setStep('RECIPIENT')} className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-white"><ChevronRight className="rotate-180" /></button>
                <div>
                   <h2 className="text-xl font-bold text-white leading-tight">{bank}</h2>
                   <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{recipientName}</p>
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
                     {categories.map(cat => (
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
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 p-4 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                  <img src={BANK_LOGOS[bank]} className="max-w-full max-h-full object-contain" alt="Bank Logo" />
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

  const addCategory = (name: string) => {
    if (name && !customCategories.includes(name)) {
      setCustomCategories(prev => [...prev, name]);
    }
  };

  const HistoryPage = ({ categories, addCategory }: { categories: string[], addCategory: (c: string) => void }) => {
    const [newCategory, setNewCategory] = useState('');
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
              {['Semua', ...categories].map((f) => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${activeFilter === f ? 'bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800'}`}
                >
                  {f}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-2 bg-zinc-950 p-1 rounded-full border border-zinc-800">
                <input 
                   type="text" 
                   placeholder="New..."
                   value={newCategory}
                   onChange={(e) => setNewCategory(e.target.value)}
                   className="bg-zinc-900 border-none rounded-full px-3 py-1 text-[10px] text-white outline-none w-20"
                />
                <button 
                   onClick={() => {
                       if (newCategory.trim()) {
                           addCategory(newCategory.trim());
                           setNewCategory('');
                       }
                   }}
                   className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black hover:bg-blue-500"
                >
                   +
                </button>
              </div>
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
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trx.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border border-white/5 shadow-inner overflow-hidden`}>
                          {trx.type === 'Transfer' && getBankLogo(trx.name) ? (
                            <div className="w-full h-full bg-white flex items-center justify-center p-2">
                               <img src={getBankLogo(trx.name)!} className="max-w-full max-h-full object-contain" alt="Bank" />
                            </div>
                          ) : (
                            trx.isPositive ? <ArrowDownLeft className="w-5 h-5" /> : (trx.method === 'QRIS' ? <Plane className="w-5 h-5 rotate-[15deg]" /> : <ArrowUpRight className="w-5 h-5" />)
                          )}
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
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${trx.isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'} overflow-hidden relative border-4 border-zinc-800`}>
              {trx.type === 'Transfer' && getBankLogo(trx.name) ? (
                <div className="w-full h-full bg-white flex items-center justify-center p-4">
                   <img src={getBankLogo(trx.name)!} className="max-w-full max-h-full object-contain" alt="Bank" />
                </div>
              ) : (
                <CheckCircle2 className="w-10 h-10" />
              )}
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

  const WalletPage = ({ balance, history }: { balance: number, history: Transaction[] }) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
    const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#91befa', '#1e40af', '#1d4ed8', '#1e3a8a', '#312e81'];

    const analyzedData = useMemo(() => {
        const now = new Date();
        const daysToFilter = timeRange === '7d' ? 7 : 30;
        const cutoffDate = new Date(now.getTime() - daysToFilter * 24 * 60 * 60 * 1000);

        const filteredTrans = history.filter(t => {
            if (!t.createdAt || t.isPositive) return false;
            const tDate = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
            return tDate >= cutoffDate;
        });

        const categoriesMap: { [key: string]: number } = {};
        const dailyMap: { [key: string]: number } = {};
        const rangeArr = [];

        for (let i = daysToFilter - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            rangeArr.push(dateStr);
            dailyMap[dateStr] = 0;
        }

        filteredTrans.forEach(t => {
            const cat = t.category || 'Other';
            categoriesMap[cat] = (categoriesMap[cat] || 0) + t.amount;

            const tDate = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
            const dateStr = tDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            if (dailyMap[dateStr] !== undefined) dailyMap[dateStr] += t.amount;
        });

        return {
            pieData: Object.keys(categoriesMap).map(name => ({ name, value: categoriesMap[name] })).sort((a, b) => b.value - a.value),
            barData: rangeArr.map(date => ({ date, amount: dailyMap[date] })),
            totalSpent: filteredTrans.reduce((acc, t) => acc + t.amount, 0)
        };
    }, [history, timeRange]);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 overflow-y-auto px-6 pb-40 space-y-8">
            <div className="pt-8 text-center text-white">
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">TOTAL BALANCE</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                   <h2 className="text-4xl font-black italic tracking-tighter">{formatIDR(balance)}</h2>
                </div>
            </div>

            <div className="flex items-center justify-center p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-fit mx-auto">
               {(['7d', '30d'] as const).map(range => (
                 <button 
                   key={range}
                   onClick={() => setTimeRange(range)}
                   className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-white'}`}
                 >
                   Last {range === '7d' ? '7' : '30'} Days
                 </button>
               ))}
            </div>
            
            <div className="bg-zinc-900/40 p-6 rounded-[32px] border border-white/5 relative">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Spending Trends</p>
                    <p className="text-white font-black text-xs italic tracking-tighter">{formatIDR(analyzedData.totalSpent)}</p>
                </div>
                {analyzedData.pieData.length > 0 ? (
                    <div className="h-64 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={analyzedData.pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {analyzedData.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '10px' }} itemStyle={{ color: '#fff' }} formatter={(val: number) => [formatIDR(val), 'Spent']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 opacity-20 text-white">
                        <History className="w-10 h-10 mb-2" />
                        <p className="text-xs font-bold uppercase">No data for this period</p>
                    </div>
                )}

                <div className="h-48">
                    <p className="text-zinc-600 font-black uppercase tracking-widest text-[8px] mb-4">Daily Activity</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyzedData.barData}>
                            <XAxis dataKey="date" hide />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '10px' }} cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }} formatter={(val: number) => [formatIDR(val), 'Total']} />
                            <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={timeRange === '7d' ? 30 : 10} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="space-y-4">
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-2">MY CARDS</p>
                <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[32px] p-8 flex flex-col justify-between text-white shadow-2xl border border-zinc-700">
                     <div className="relative z-10 flex justify-between">
                         <p className="font-bold">Virtual Card</p>
                         <div className="w-8 h-8 rounded-lg bg-white p-1">
                             <img src={BANK_LOGOS['Super Bank Express']} className="w-full h-full object-contain" alt="Logo" />
                         </div>
                     </div>
                     <p className="relative z-10 font-mono text-xl tracking-widest mt-4">**** **** **** 9482</p>
                     <div className="relative z-10 flex justify-between items-end">
                         <p className="font-bold uppercase">{user.name}</p>
                         <div className="flex -space-x-3">
                             <div className="w-8 h-8 rounded-full bg-red-500/80" />
                             <div className="w-8 h-8 rounded-full bg-orange-500/80" />
                         </div>
                     </div>
                </div>
            </div>
        </motion.div>
    );
};

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
            <div className="flex items-center justify-center gap-2 mt-2">
               <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/5 px-3 py-1 rounded-full">{user.accountId}</p>
               <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user.accountId);
                    setNotification("ID Rekening disalin");
                  }}
                  className="text-zinc-500 hover:text-white transition-colors"
               >
                  <Smartphone className="w-3 h-3" />
               </button>
            </div>
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

        {/* Mockup Features Section */}
        <div className="bg-white rounded-[32px] p-6 mb-8 shadow-xl border border-zinc-100">
           <h4 className="text-blue-900 font-black italic tracking-tighter mb-4 text-sm uppercase">PREMIUM SERVICE STATUS</h4>
           <div className="space-y-3">
              {[
                { label: 'Convenience and Speed', color: 'bg-yellow-400' },
                { label: 'High Security', color: 'bg-blue-600' },
                { label: 'Global Accessibility', color: 'bg-yellow-400' },
                { label: 'Real-Time Updates', color: 'bg-blue-600' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className={`w-5 h-5 ${item.color} rounded-full flex items-center justify-center`}>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                   </div>
                   <span className="text-zinc-800 font-bold text-xs">{item.label}</span>
                </div>
              ))}
           </div>
           <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
              <div>
                 <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest leading-none mb-1">Current Version</p>
                 <p className="text-blue-600 font-black text-xs italic tracking-tighter">VISA PAYMENT v2.1</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="bg-blue-600 text-white text-[8px] font-black uppercase px-4 py-2 rounded-full shadow-lg shadow-blue-500/20"
              >
                Upgrade Now
              </motion.button>
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
      <AnimatePresence mode="wait">
        {!hasShownSplash ? (
          <SplashScreen key="splash" onComplete={() => setHasShownSplash(true)} />
        ) : loading ? (
          <motion.div key="loader" className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </motion.div>
        ) : !isAuthenticated ? (
          <LoginScreen key="login" onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <motion.div 
            key="main"
            className="w-full max-w-md h-screen flex flex-col bg-zinc-950 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Main App Background Image */}
            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
              <img 
                src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=2070&auto=format&fit=crop" 
                alt="Background" 
                className="w-full h-full object-cover blur-sm"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-950" />
            </div>

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
                initial={{ opacity: 0, x: -40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex-1 overflow-y-auto px-6 pb-32"
              >
                {/* Large Balance Display */}
                <section className="mb-8 pt-4">
                    <p className="text-zinc-500 text-sm font-semibold mb-1">Saldo Total</p>
                    <div className="flex items-center gap-2 mb-2">
                       <p className="text-blue-500/80 text-[10px] font-black uppercase tracking-widest">ID Rekening: {user.accountId}</p>
                       <button 
                         onClick={() => {
                            navigator.clipboard.writeText(user.accountId);
                            setNotification("ID Rekening disalin ke papan klip");
                         }}
                         className="px-2 py-0.5 bg-blue-500/10 rounded-full text-[8px] font-black text-blue-500 uppercase hover:bg-blue-500/20 transition-colors"
                       >
                         Copy
                       </button>
                    </div>
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
                      className="relative h-56 bg-white rounded-[32px] p-8 overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.2)] group active:scale-[0.98] transition-transform border border-zinc-100"
                    >
                      {/* Graphics from the mockup */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3" />
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/5 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2" />
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">VISA PLATINUM</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-6 bg-white rounded-md flex items-center justify-center p-0.5">
                                    <img src={BANK_LOGOS['Super Bank Express']} className="max-w-full max-h-full object-contain" alt="Logo" />
                                  </div>
                                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Digital Priority</span>
                                </div>
                            </div>
                            <div className="text-right">
                              <h2 className="text-blue-900 font-black italic text-xl tracking-tighter leading-none">VISA</h2>
                              <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Payment App</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-xl tracking-[0.2em] text-zinc-800">4452 9001 7731 ****</p>
                                <div className="w-8 h-8 rounded-lg bg-white p-1">
                                    <img src={BANK_LOGOS['Super Bank Express']} className="w-full h-full object-contain" alt="Logo" />
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                  <p className="text-[8px] text-zinc-400 font-bold uppercase">Card Holder</p>
                                  <p className="text-zinc-900 text-sm font-bold uppercase tracking-tight">{user.name}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-8 rounded-full bg-blue-600" />
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 -ml-4 opacity-80" />
                                </div>
                            </div>
                          </div>
                      </div>
                    </motion.div>
                </section>

                {/* Action Grid */}
                <section className="grid grid-cols-4 gap-4 mb-10">
                    {[
                      { icon: ArrowUpRight, label: 'Kirim', color: 'bg-white/5', action: () => setShowTransfer(true) },
                      { icon: ArrowDownLeft, label: 'Terima', color: 'bg-white/5', action: () => setShowReceive(true) },
                      { icon: CreditCard, label: 'Card', color: 'bg-white/5', action: () => {} },
                      { icon: MoreHorizontal, label: 'Lainnya', color: 'bg-white/5', action: () => {} }
                    ].map((act, i) => (
                      <motion.button 
                        key={i}
                        whileHover={{ y: -4, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={act.action}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className={`w-full aspect-square rounded-[24px] ${act.color} border border-white/5 flex items-center justify-center shadow-lg shadow-black/20 hover:shadow-blue-500/10 hover:border-blue-500/20 transition-all backdrop-blur-md`}>
                          <act.icon className="text-zinc-300 w-6 h-6" />
                        </div>
                        <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{act.label}</span>
                      </motion.button>
                    ))}
                </section>

                {/* Upcoming Events */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black italic tracking-tighter">UPCOMING EVENTS</h3>
                </div>
                <div className="space-y-4">
                  {EVENTS.map((event, index) => (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: -40, rotateX: 10 }}
                        animate={{ opacity: 1, x: 0, rotateX: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: index * 0.1 }}
                        className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-[28px] hover:bg-white/10 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-500 border border-white/5">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{event.name}</p>
                               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{event.category} • {event.date} {event.time}</p>
                            </div>
                        </div>
                      </motion.div>
                  ))}
                </div>
            </section>
          </motion.main>
        )}

        {activeView === 'WALLET' && (
          <WalletPage balance={balance} history={history} />
        )}
        {activeView === 'HISTORY' && (
          <HistoryPage categories={customCategories} addCategory={addCategory} />
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
      <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/80 backdrop-blur-3xl border-t border-white/5 px-6 py-6 pb-12 flex justify-center z-50">
         <div className="max-w-md w-full flex items-center justify-between">
            {[
              { icon: LayoutDashboard, label: 'Home', id: 'HOME' },
              { icon: Wallet, label: 'Wallet', id: 'WALLET' }
            ].map((btn, i) => (
              <button 
                key={i} 
                onClick={() => setActiveView(btn.id as View)}
                className={`flex flex-col items-center gap-1 ${activeView === btn.id ? 'text-blue-500' : 'text-zinc-600'} hover:text-blue-400 transition-colors`}
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
                 className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] ring-8 ring-zinc-950 group"
               >
                 <Maximize2 className="w-8 h-8 group-hover:rotate-[90deg] transition-transform" />
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
                className={`flex flex-col items-center gap-1 ${activeView === btn.id ? 'text-blue-500' : 'text-zinc-600'} hover:text-blue-400 transition-colors`}
              >
                <btn.icon className="w-6 h-6" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{btn.label}</span>
              </button>
            ))}
         </div>
      </nav>

      <AnimatePresence>
        {isLoggedOut && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[300] bg-zinc-950 flex flex-col items-center justify-center"
          >
              <div className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center mb-6">
                 <ShieldCheck className="text-blue-500 w-12 h-12" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Sesi Diamankan</h2>
              <p className="text-zinc-500 text-sm">Menghapus data sesi Super Bank Express...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <GeminiChat history={history} balance={balance} />
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
        categories={customCategories}
      />
    )}
    {showReceive && (
      <ReceiveQRModal 
        user={{ ...user, uid: firebaseUser?.uid }} 
        onClose={() => setShowReceive(false)} 
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
    </div>
  );
}
