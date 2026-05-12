import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  Droplets, 
  Zap, 
  ShieldPlus, 
  PiggyBank, 
  Ticket, 
  MonitorPlay,
  Flame,
  Plane,
  Gamepad2,
  GraduationCap,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

export const MoreServicesModal = ({ onClose, onPayment, balance }: { onClose: () => void, onPayment: (biller: string, amount: number, account: string, category: string) => void, balance: number }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [step, setStep] = useState<'SELECT_AMOUNTS' | 'CONFIRM' | 'SUCCESS'>('SELECT_AMOUNTS');
  const [isProcessing, setIsProcessing] = useState(false);

  const [pulsaType, setPulsaType] = useState<'pulsa' | 'data'>('pulsa');
  const [packageName, setPackageName] = useState<string | null>(null);

  const services = [
    { id: 'pulsa', icon: Smartphone, label: 'Pulsa & Data', color: 'bg-blue-500/10 text-blue-500', isNew: false, placeholder: 'Nomor Handphone (08...)' },
    { id: 'pln', icon: Zap, label: 'Token Listrik', color: 'bg-yellow-500/10 text-yellow-500', isNew: false, placeholder: 'ID Pelanggan / No. Meter' },
    { id: 'water', icon: Droplets, label: 'Air PDAM', color: 'bg-cyan-500/10 text-cyan-500', isNew: false, placeholder: 'Nomor Pelanggan' },
    { id: 'internet', icon: Wifi, label: 'Internet & TV', color: 'bg-purple-500/10 text-purple-500', isNew: false, placeholder: 'Nomor Pelanggan' },
    { id: 'bpjs', icon: ShieldPlus, label: 'BPJS', color: 'bg-emerald-500/10 text-emerald-500', isNew: false, placeholder: 'Nomor BPJS' },
    { id: 'emoney', icon: PiggyBank, label: 'e-Wallet', color: 'bg-orange-500/10 text-orange-500', isNew: true, placeholder: 'Nomor HP e-Wallet' },
    { id: 'tickets', icon: Ticket, label: 'Tiket Bioskop', color: 'bg-pink-500/10 text-pink-500', isNew: false, placeholder: 'ID Pesanan' },
    { id: 'streaming', icon: MonitorPlay, label: 'Streaming', color: 'bg-red-500/10 text-red-500', isNew: false, placeholder: 'ID Akun' },
    { id: 'gas', icon: Flame, label: 'Gas PGN', color: 'bg-orange-600/10 text-orange-600', isNew: false, placeholder: 'ID Pelanggan' },
    { id: 'travel', icon: Plane, label: 'Tiket Travel', color: 'bg-sky-500/10 text-sky-500', isNew: false, placeholder: 'Kode Booking' },
    { id: 'game', icon: Gamepad2, label: 'Voucher Game', color: 'bg-indigo-500/10 text-indigo-500', isNew: true, placeholder: 'User ID' },
    { id: 'edu', icon: GraduationCap, label: 'Pendidikan', color: 'bg-fuchsia-500/10 text-fuchsia-500', isNew: false, placeholder: 'NIM / NISN' },
  ];

  const presetAmounts = [20000, 50000, 100000, 150000, 200000, 300000, 500000, 1000000];

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const activeService = services.find(s => s.id === selectedCategory);

  const getProvider = (number: string) => {
    if (!number || number.length < 4) return null;
    const prefix = number.substring(0, 4);
    
    if (['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'].includes(prefix)) {
      return { name: 'Telkomsel', color: 'text-red-500', bg: 'bg-red-500/10' };
    }
    if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix)) {
      return { name: 'Indosat', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    }
    if (['0817', '0818', '0819', '0859', '0877', '0878', '0831', '0832', '0833', '0838'].includes(prefix)) {
      return { name: 'XL/Axis', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    }
    if (['0895', '0896', '0897', '0898', '0899'].includes(prefix)) {
      return { name: 'Tri (3)', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    }
    if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix)) {
      return { name: 'Smartfren', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' };
    }
    
    return null;
  };

  const detectedProvider = activeService?.id === 'pulsa' ? getProvider(accountNumber) : null;

  const getDataPackages = (providerName: string | undefined) => {
    const today = new Date().getDate(); // 1-31
    const basePackages = [
      { gb: 5 + (today % 3), days: 7, basePrice: 15000 },
      { gb: 12 + (today % 5), days: 30, basePrice: 45000 },
      { gb: 25 + (today % 7), days: 30, basePrice: 85000 },
      { gb: 50 + (today % 10), days: 30, basePrice: 135000 },
    ];

    return basePackages.map(p => {
        let name = `Internet ${p.gb}GB / ${p.days} Hari`;
        let price = p.basePrice;
        if (providerName === 'Telkomsel') {
            name = `OMG! ${p.gb}GB ${p.days} Hari`;
            price += 5000;
        } else if (providerName === 'XL/Axis') {
            name = `Xtra Combo ${p.gb}GB ${p.days}Hr`;
        } else if (providerName === 'Indosat') {
            name = `Freedom ${p.gb}GB ${p.days}Hr`;
            price -= 2000;
        }

        // Adjust price dynamically slightly based on the day
        const finalPrice = price + (today * 100);

        return {
            id: `data-${p.gb}-${p.days}`,
            name,
            price: finalPrice,
            days: p.days
        }
    });
  };

  const handlePay = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          setStep('SUCCESS');
          setTimeout(() => {
              if (activeService && amount && accountNumber) {
                  const billerLabel = packageName 
                    ? `${activeService.label} - ${packageName}`
                    : activeService.label;
                  onPayment(billerLabel, amount, accountNumber, 'Biller');
              }
          }, 1500);
      }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-zinc-950 w-full max-w-md rounded-[40px] border border-white/10 flex flex-col min-h-[50vh] max-h-[85vh] shadow-[0_0_50px_rgba(37,99,235,0.15)] overflow-hidden"
      >
        <AnimatePresence mode="wait">
            {!selectedCategory ? (
                <motion.div 
                    key="menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full p-6"
                >
                    <div className="flex items-center justify-between mb-8 mt-2">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase pl-2">Layanan Lainnya</h2>
                        <button onClick={onClose} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
                        <div className="grid grid-cols-4 gap-x-2 gap-y-6">
                            {services.map((svc) => (
                                <motion.button
                                    key={svc.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(svc.id)}
                                    className="flex flex-col items-center gap-2 relative group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${svc.color} border border-white/5 group-hover:border-white/20 transition-colors`}>
                                        <svc.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold text-center text-zinc-400 leading-tight group-hover:text-white transition-colors">{svc.label}</span>
                                    {svc.isNew && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-zinc-950">
                                            New
                                        </span>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-zinc-900">
                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-5 flex items-center justify-between overflow-hidden relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                <div className="relative z-10">
                                    <h3 className="text-white font-black italic tracking-tighter uppercase mb-1">Promo Khusus</h3>
                                    <p className="text-zinc-400 text-xs font-medium max-w-[200px]">Diskon hingga 50% untuk pembayaran tagihan PLN bulan ini.</p>
                                </div>
                                <div className="relative z-10 bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-blue-400">
                                    Klaim
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : step === 'SELECT_AMOUNTS' ? (
                <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col h-full p-6"
                >
                    <div className="flex items-center justify-between mb-8 mt-2">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setSelectedCategory(null); setAccountNumber(''); setAmount(null); }} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">{activeService?.label}</h2>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Pembayaran</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-2">Detail Tagihan</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder={activeService?.placeholder || "Masukkan Nomor"}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-white outline-none focus:border-blue-500/50 font-mono text-lg"
                                />
                                {detectedProvider && (
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${detectedProvider.bg} ${detectedProvider.color} shadow-lg pointer-events-none`}>
                                        {detectedProvider.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {accountNumber.length > 5 && (
                            <div className="space-y-4">
                                {activeService?.id === 'pulsa' && (
                                    <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl mb-4">
                                        <button 
                                            onClick={() => setPulsaType('pulsa')}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors ${pulsaType === 'pulsa' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Pulsa
                                        </button>
                                        <button 
                                            onClick={() => { setPulsaType('data'); setAmount(null); setPackageName(null); }}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors ${pulsaType === 'data' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Paket Data
                                        </button>
                                    </div>
                                )}
                            
                                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-2">
                                    {activeService?.id === 'pulsa' && pulsaType === 'data' ? 'Pilih Paket' : 'Pilih Nominal'}
                                </label>
                                
                                {activeService?.id === 'pulsa' && pulsaType === 'data' ? (
                                    <div className="space-y-3">
                                        {getDataPackages(detectedProvider?.name).map((pkg) => (
                                            <button
                                                key={pkg.id}
                                                onClick={() => { setAmount(pkg.price); setPackageName(pkg.name); }}
                                                className={`w-full p-4 rounded-3xl border text-left transition-colors flex items-center justify-between ${amount === pkg.price && packageName === pkg.name ? 'bg-blue-600/20 border-blue-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${amount === pkg.price && packageName === pkg.name ? 'text-blue-500' : 'text-white'}`}>{pkg.name}</span>
                                                    <span className="text-zinc-500 text-xs font-medium">Aktif s.d {new Date(Date.now() + pkg.days * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                                </div>
                                                <span className={`font-black tracking-tight ${amount === pkg.price && packageName === pkg.name ? 'text-blue-500' : 'text-white'}`}>{formatIDR(pkg.price)}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {presetAmounts.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => { setAmount(amt); setPackageName(null); }}
                                                className={`p-4 rounded-3xl border text-center font-bold transition-colors ${amount === amt && !packageName ? 'bg-blue-600/20 border-blue-500 text-blue-500' : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700'}`}
                                            >
                                                {formatIDR(amt)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-zinc-900">
                        <button 
                            disabled={!amount || !accountNumber}
                            onClick={() => setStep('CONFIRM')}
                            className={`w-full py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all ${!amount || !accountNumber ? 'bg-zinc-900 text-zinc-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                        >
                            Lanjutkan
                        </button>
                    </div>
                </motion.div>
            ) : step === 'CONFIRM' ? (
                <motion.div 
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col h-full p-6"
                >
                    <div className="flex-1 flex flex-col justify-center text-center space-y-8">
                         <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${activeService?.color.replace('text', 'bg')} border border-white/10`}>
                             {activeService && <activeService.icon className="w-12 h-12 text-white" />}
                         </div>
                         <div>
                             <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">Konfirmasi Pembayaran</p>
                             <h3 className="text-3xl font-black text-white">{formatIDR(amount || 0)}</h3>
                         </div>
                         <div className="bg-zinc-900/50 rounded-3xl p-6 text-left space-y-4 border border-zinc-800">
                             <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
                                 <span className="text-zinc-500 text-xs font-bold uppercase">Layanan</span>
                                 <span className="text-white font-bold">{activeService?.label}</span>
                             </div>
                             <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
                                 <span className="text-zinc-500 text-xs font-bold uppercase">Nomor</span>
                                 <span className="text-white font-mono font-bold">{accountNumber}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-zinc-500 text-xs font-bold uppercase">Biaya Admin</span>
                                 <span className="text-emerald-500 font-bold">Gratis</span>
                             </div>
                         </div>
                         
                         {balance < (amount || 0) && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-left">
                                <p className="text-red-500 text-xs font-bold">Saldo tidak mencukupi untuk transaksi ini.</p>
                            </div>
                         )}
                    </div>
                    
                    <div className="pt-4 space-y-3">
                         <button 
                            disabled={isProcessing || balance < (amount || 0)}
                            onClick={handlePay}
                            className={`w-full py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all ${(isProcessing || balance < (amount || 0)) ? 'bg-zinc-900 text-zinc-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                        >
                            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                        </button>
                        <button 
                            disabled={isProcessing}
                            onClick={() => setStep('SELECT_AMOUNTS')}
                            className="w-full py-4 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col h-full p-6 items-center justify-center text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Pembayaran Berhasil!</h3>
                        <p className="text-zinc-400 text-sm">Transaksi {activeService?.label} anda telah diproses.</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
