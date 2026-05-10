import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// Initialize AI - assumes process.env.GEMINI_API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const GeminiChat = ({ history, balance }: { history: any[], balance: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: "Halo! Saya asisten keuangan Anda. Ada yang bisa saya bantu?" }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `Anda adalah asisten keuangan pribadi yang membantu pengguna memahami transaksi dan saldo mereka. 
          Berikut adalah konteks data pengguna:
          Saldo saat ini: ${balance}
          Riwayat transaksi: ${JSON.stringify(history.slice(-10))}` 
        }
      });

      const response = await chat.sendMessage({ message: input });
      
      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Maaf, saya tidak bisa menjawab saat ini." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Terjadi kesalahan saat menghubungi layanan AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 h-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <span className="text-white font-bold text-sm flex items-center gap-2"><Bot size={16} /> Gemini Finance AI</span>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-xl text-xs ${m.role === 'user' ? 'bg-blue-600/20 text-blue-100 ml-auto max-w-[80%]' : 'bg-zinc-800 text-zinc-300 mr-auto max-w-[80%]'}`}>
                  {m.text}
                </div>
              ))}
              {isLoading && <div className="text-xs text-zinc-500 italic">Berpikir...</div>}
            </div>

            <div className="p-3 border-t border-zinc-800 flex gap-2 bg-zinc-950">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Tanya sesuatu..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
              <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50" disabled={isLoading}>
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-blue-500/50 transition-all"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
};
