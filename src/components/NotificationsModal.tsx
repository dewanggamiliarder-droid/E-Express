import React from 'react';
import { motion } from 'motion/react';
import { X, Bell, Zap, ShieldCheck, ArrowDownLeft, TrendingUp } from 'lucide-react';

export const NotificationsModal = ({ onClose }: { onClose: () => void }) => {
  const notifications = [
    {
      id: 1,
      title: 'Transfer Berhasil Diterima',
      message: 'Dana sebesar Rp 2.500.000 dari John Doe telah masuk.',
      time: 'Baru saja',
      icon: ArrowDownLeft,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      id: 2,
      title: 'AI Protection Aktif',
      message: 'Sistem mendeteksi login baru dari perangkat tidak dikenal dan memblokirnya.',
      time: '2 jam yang lalu',
      icon: ShieldCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 3,
      title: 'Promo Flash Sale',
      message: 'Cashback 50% untuk pembayaran tagihan PLN bulan ini!',
      time: '12 jam yang lalu',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      id: 4,
      title: 'Laporan Keuangan Mingguan',
      message: 'Pengeluaran mingguan Anda turun sebesar 15%. Kerja bagus!',
      time: 'Kemarin',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-zinc-950 w-full max-w-sm h-full border-l border-white/10 flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
               <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Notifikasi</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
            {notifications.map(notif => (
                <div key={notif.id} className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-800 p-4 rounded-3xl transition-colors cursor-pointer group">
                    <div className="flex gap-4">
                        <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.bgColor} ${notif.color}`}>
                            <notif.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-white font-bold text-sm tracking-tight">{notif.title}</h3>
                                <span className="text-[10px] font-black uppercase text-zinc-500 whitespace-nowrap">{notif.time}</span>
                            </div>
                            <p className="text-zinc-400 text-xs leading-relaxed">{notif.message}</p>
                        </div>
                    </div>
                </div>
            ))}
            
            <div className="text-center pt-8 pb-4">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Tidak ada notifikasi lainnya</p>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
