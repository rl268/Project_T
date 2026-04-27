import { useState, useEffect } from 'react';
import { searchFood, saveMeal, getDailyLog } from '../services/api';
import { Search, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LogMeal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [selectedMood, setSelectedMood] = useState('😐');
  const [addedItems, setAddedItems] = useState({});
  const [dailyLog, setDailyLog] = useState([]);

  useEffect(() => {
    loadDailyLog();
  }, []);

  const loadDailyLog = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = await getDailyLog(today);
      setDailyLog(data.meals || []);
    } catch (err) { 
      setError("Failed to load today's log.");
    }
    setInitLoading(false);
  };

  const updateStreak = (today) => {
    const lastLogDate = localStorage.getItem('lastLogDate');
    if (lastLogDate !== today) {
       let currentStreak = parseInt(localStorage.getItem('streakCounter') || '0', 10);
       const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
       if (lastLogDate === yesterday) currentStreak += 1;
       else currentStreak = 1; 
       localStorage.setItem('streakCounter', currentStreak.toString());
       localStorage.setItem('lastLogDate', today);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchFood(query);
      setResults(data);
      setAddedItems({});
    } catch (err) { 
      setError("Failed to search food. The API might be down.");
    }
    setLoading(false);
  };

  const handleAdd = async (item, idx) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await saveMeal({ ...item, mealType: selectedMealType, date: today, mood: selectedMood });
      setAddedItems(prev => ({...prev, [idx]: true}));
      updateStreak(today);
      await loadDailyLog();
      setTimeout(() => setAddedItems(prev => ({...prev, [idx]: false})), 2000);
    } catch (err) { 
      setError("Failed to log meal to the backend.");
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const moods = ['😊', '😐', '😔'];

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (initLoading) return <div className="p-12 flex justify-center min-h-[100dvh] items-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="p-6 pb-24 space-y-8 min-h-[100dvh]">
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-2">Log Meal</h2>
        
        {error && (
          <div className="p-4 glass-card text-rose-700 rounded-2xl flex items-center space-x-2 border-rose-200 bg-rose-50/50">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="glass-card p-6 rounded-3xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 -right-10 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide relative z-10">
            {mealTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`px-5 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-all duration-300 ${
                  selectedMealType === type 
                    ? 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] transform scale-105' 
                    : 'bg-white/50 text-slate-500 hover:bg-white hover:text-primary shadow-sm border border-white/60'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/60 shadow-inner relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">How do you feel?</span>
            <div className="flex space-x-3">
              {moods.map(m => (
                <button 
                  key={m} 
                  onClick={() => setSelectedMood(m)} 
                  className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                    selectedMood === m ? 'scale-125 bg-white shadow-lg border border-primary/20 rotate-6' : 'opacity-50 hover:opacity-100 hover:scale-110 grayscale'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative z-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for food..."
              className="w-full pl-12 pr-28 py-4 bg-white/60 rounded-2xl border border-white focus:ring-2 focus:ring-primary/50 outline-none shadow-inner text-slate-800 font-bold transition-all placeholder:font-medium placeholder:text-slate-400"
            />
            <Search className="absolute left-4 top-4 text-slate-400" size={22} />
            <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primaryDark hover:to-primary text-white px-5 rounded-[12px] font-bold shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center tracking-wide">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
          </form>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-2">Search Results</h3>
            {results.map((item, idx) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={idx} className="glass-card p-4 rounded-2xl flex items-center space-x-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-slate-100">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🥗</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                  <div className="flex space-x-3 mt-1.5 text-[11px] font-bold tracking-wide text-slate-400">
                    <span className="text-primary bg-primaryLight/30 px-2 py-0.5 rounded-md">{Math.round(item.calories)} kcal</span>
                    <span className="bg-slate-100/50 px-2 py-0.5 rounded-md">{Math.round(item.protein)}g P</span>
                    <span className="bg-slate-100/50 px-2 py-0.5 rounded-md">{Math.round(item.carbs)}g C</span>
                  </div>
                </div>
                <button onClick={() => handleAdd(item, idx)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 shadow-sm ${addedItems[idx] ? 'bg-primary text-white scale-110 shadow-primary/30' : 'bg-white text-primary hover:bg-primary hover:text-white border border-primary/10'}`}>
                  {addedItems[idx] ? <Check size={22} /> : <Plus size={22} />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200/50 rounded-full"></div>
        <h3 className="font-black text-xl text-slate-800 mb-6 tracking-tight mt-4">Today's Log</h3>
        <div className="space-y-5">
          {mealTypes.map(type => {
            const typeMeals = dailyLog.filter(m => m.mealType === type);
            if (typeMeals.length === 0) return null;
            
            return (
              <div key={type} className="glass-card p-5 rounded-3xl border border-primary/10">
                <h4 className="font-black text-slate-800 text-sm mb-4 tracking-wide">{type}</h4>
                <div className="space-y-3">
                  {typeMeals.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-white/40 p-3 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-3 truncate">
                        <span className="text-xl filter drop-shadow-sm">{item.mood}</span>
                        <span className="font-bold text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className="text-primary font-bold shrink-0 pl-3 tracking-wide">{Math.round(item.calories)} <span className="text-[10px] text-slate-400">kcal</span></span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {dailyLog.length === 0 && (
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3 opacity-50">🍽️</span>
              <p className="text-slate-400 font-bold tracking-wide">No meals logged yet today.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
