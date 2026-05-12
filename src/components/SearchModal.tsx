import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, History, ArrowUpRight, ArrowDownLeft, Zap, Smartphone } from 'lucide-react';

export const SearchModal = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  
  const recentSearches = ['Pembarnyan Tagihan', 'Transfer John Doe', 'Topup e-wallet'];
  
  const suggestedActions = [
    { label: 'Transfer Dana', icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Minta Dana', icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Tagihan Listrik', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Beli Pulsa', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-zinc-950 w-full max-w-md rounded-[32px] border border-white/10 p-6 flex flex-col shadow-[0_30px_60px_rgba(37,99,235,0.15)] overflow-hidden"
      >
        <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
                autoFocus
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari transaksi, layanan, dll..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-14 pr-12 text-white outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600 font-medium"
            />
            {query ? (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
            ) : (
                 <button 
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-wider"
                >
                  Batal
                </button>
            )}
        </div>

        <div className="space-y-8">
            {!query ? (
                <>
                    <div className="space-y-4">
                        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] px-2">Pencarian Terakhir</h3>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((search, i) => (
                                <button key={i} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors group text-left">
                                    <History className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-500" />
                                    <span className="text-zinc-300 text-xs font-medium group-hover:text-white">{search}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] px-2">Saran Pintar</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {suggestedActions.map((action, i) => (
                                <button key={i} className="flex flex-col gap-3 items-start p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bg} ${action.color} border border-white/5`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-white font-bold text-sm">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                        <Search className="w-8 h-8" />
                    </div>
                    <p className="text-white font-bold mb-2">Mencari "{query}"</p>
                    <p className="text-zinc-500 text-xs">Aplikasi sedang memproses pencarian Anda di seluruh database Neural Ledger.</p>
                </div>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
};
