import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Eye, EyeOff, Lock, Unlock, Settings, X, ShieldCheck } from 'lucide-react';

export const CardManagerModal = ({ onClose, userName, accountId }: { onClose: () => void, userName: string, accountId: string }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const cardNumber = showDetails ? "4242 4242 4242 4242" : "•••• •••• •••• 4242";
  const cvv = showDetails ? "123" : "•••";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-zinc-950 w-full min-h-[75vh] rounded-t-[40px] border-t border-white/10 p-8 flex flex-col"
      >
        <div className="w-16 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 absolute top-4 left-1/2 -translate-x-1/2" />
        
        <div className="flex items-center justify-between mb-8 mt-4">
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Manajemen Kartu</h2>
          <button onClick={onClose} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            {/* Card Preview */}
            <motion.div 
                className={`relative h-56 rounded-[32px] p-8 overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.2)] transition-colors duration-500 ${isFrozen ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100'}`}
            >
                {/* Graphics */}
                {!isFrozen && (
                  <>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/5 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2" />
                  </>
                )}
                {isFrozen && (
                   <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40 backdrop-blur-[2px] z-20">
                      <div className="bg-zinc-900/90 text-red-500 px-6 py-2 rounded-full font-black text-sm border border-red-500/20 uppercase tracking-widest flex items-center gap-2 shadow-xl">
                          <Lock className="w-4 h-4" /> Kartu Dibekukan
                      </div>
                   </div>
                )}
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isFrozen ? 'text-zinc-500' : 'text-zinc-400'}`}>Kartu Virtual</p>
                            <h3 className={`text-xl font-bold tracking-tighter leading-none ${isFrozen ? 'text-zinc-400' : 'text-zinc-900'}`}>{userName}</h3>
                        </div>
                        <CreditCard className={`w-8 h-8 ${isFrozen ? 'text-zinc-600' : 'text-blue-600'}`} />
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isFrozen ? 'text-zinc-500' : 'text-zinc-400'}`}>Card Number</p>
                            <p className={`font-mono text-xl tracking-widest font-medium w-full flex justify-between ${isFrozen ? 'text-zinc-400' : 'text-zinc-900'}`}>{cardNumber}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-8">
                                <div>
                                    <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isFrozen ? 'text-zinc-500' : 'text-zinc-400'}`}>Valid Thru</p>
                                    <p className={`font-mono text-sm font-bold ${isFrozen ? 'text-zinc-400' : 'text-zinc-900'}`}>12/28</p>
                                </div>
                                <div>
                                    <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isFrozen ? 'text-zinc-500' : 'text-zinc-400'}`}>CVV</p>
                                    <p className={`font-mono text-sm font-bold ${isFrozen ? 'text-zinc-400' : 'text-zinc-900'}`}>{cvv}</p>
                                </div>
                            </div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="MC" className={`h-8 object-contain ${isFrozen ? 'grayscale opacity-50' : ''}`} />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800/80 transition-colors"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                    <span className="text-white font-bold text-sm">{showDetails ? 'Sembunyikan Info' : 'Lihat Info Kartu'}</span>
                </button>
                <button 
                  onClick={() => setIsFrozen(!isFrozen)}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800/80 transition-colors"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isFrozen ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isFrozen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <span className="text-white font-bold text-sm">{isFrozen ? 'Buka Beku' : 'Bekukan Kartu'}</span>
                </button>
            </div>

            <div className="space-y-3 pb-8">
                <div className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-400">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold">Ubah PIN Kartu</p>
                            <p className="text-zinc-500 text-xs">Ubah PIN untuk ATM dan transaksi</p>
                        </div>
                    </div>
                    <span className="text-blue-500 font-bold text-xs uppercase cursor-pointer">Ubah</span>
                </div>
                <div className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold">Batas Transaksi Harian</p>
                            <p className="text-zinc-500 text-xs">Rp 50.000.000</p>
                        </div>
                    </div>
                    <span className="text-blue-500 font-bold text-xs uppercase cursor-pointer">Atur</span>
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
