import { useState, useEffect } from 'react';
import { getSmartSuggestions } from '../services/api';
import { Lightbulb, Loader2, ArrowRight, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await getSmartSuggestions(today);
        setSuggestions(data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchSuggestions();
  }, []);

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (loading) return <div className="p-12 flex justify-center min-h-[100dvh] items-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="p-6 pb-24 space-y-6 min-h-[100dvh]">
      <div className="flex items-center space-x-3 mb-8 mt-4">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
          <Lightbulb className="text-white" size={28} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Smart Swaps</h2>
      </div>

      <div className="glass-card p-6 rounded-3xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <p className="text-slate-600 font-medium relative z-10 text-sm leading-relaxed">
          AI-powered insights based on what you ate today to help you hit your nutritional goals faster.
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3 opacity-50">✨</span>
            <p className="text-slate-500 font-bold tracking-wide">You're eating perfectly today!<br/><span className="text-xs font-normal text-slate-400">No swaps needed.</span></p>
          </div>
        ) : (
          suggestions.map((s, idx) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="glass-card p-5 rounded-3xl border border-white/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase line-clamp-1 max-w-[40%] text-center">{s.original}</span>
                <ArrowRight className="text-slate-300 shrink-0" size={18} />
                <span className="font-bold text-primary bg-primaryLight/50 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase line-clamp-1 max-w-[40%] text-center shadow-sm">{s.alternative}</span>
              </div>
              
              <div className="bg-white/50 p-4 rounded-2xl shadow-inner border border-slate-50">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  <TrendingDown className="inline mr-2 text-primary pb-1" size={18} />
                  {s.reason}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
