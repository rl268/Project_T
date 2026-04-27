import { useState, useEffect } from 'react';
import { getProfile, getDailyLog, getWeeklySummary } from '../services/api';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import {
  Loader2, AlertCircle, Droplet, Flame, Target,
  Coffee, Sun, Sunset, Moon, CheckCircle2, Circle,
  Lightbulb, TrendingUp, TrendingDown
} from 'lucide-react';

// ---------- helpers ----------
const MEAL_SLOTS = [
  { type: 'Breakfast', icon: Coffee, time: '8 AM',  color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  { type: 'Lunch',     icon: Sun,    time: '1 PM',  color: 'text-orange-500', bg: 'bg-orange-50',  border: 'border-orange-200' },
  { type: 'Dinner',    icon: Sunset, time: '7 PM',  color: 'text-rose-500',   bg: 'bg-rose-50',    border: 'border-rose-200' },
  { type: 'Snacks',    icon: Moon,   time: 'Anytime',color: 'text-violet-500',bg: 'bg-violet-50', border: 'border-violet-200' },
];

const MACRO_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 rounded-2xl text-xs shadow-xl">
        <p className="font-bold text-slate-600 mb-1">{label}</p>
        <p className="font-black text-primary">{Math.round(payload[0]?.value)} kcal</p>
        {payload[1] && <p className="text-slate-400">Goal: {Math.round(payload[1]?.value)} kcal</p>}
      </div>
    );
  }
  return null;
};

// ---------- component ----------
export default function Dashboard() {
  const [profile, setProfile]       = useState(null);
  const [logData, setLogData]       = useState({ meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [streak, setStreak]         = useState(0);
  const [water, setWater]           = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const [p, log, weekly] = await Promise.all([
          getProfile(),
          getDailyLog(today),
          getWeeklySummary(today),
        ]);
        setProfile(p);
        setLogData(log);
        // enrich weekly data with goal line
        const target = p?.targetCalories || 2000;
        setWeeklyData(
          (weekly || []).map(d => ({
            day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
            calories: Math.round(d.calories),
            goal: target,
          }))
        );
        setStreak(parseInt(localStorage.getItem('streakCounter') || '0', 10));
        const waterKey = `water_${today}`;
        setWater(parseInt(localStorage.getItem(waterKey) || '0', 10));
      } catch (err) {
        setError("Could not load dashboard data. Is the backend running?");
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleWaterClick = (idx) => {
    const today = new Date().toISOString().split('T')[0];
    const newWater = idx < water ? idx : idx + 1;
    setWater(newWater);
    localStorage.setItem(`water_${today}`, newWater.toString());
  };

  // ---- derived values ----
  const target        = profile?.targetCalories || 2000;
  const { calories, protein, carbs, fat } = logData.totals;
  const pct           = Math.min((calories / target) * 100, 100);
  const waterMl       = water * 250;

  const getTopMood = () => {
    const moods = (logData.meals || []).map(m => m.mood).filter(Boolean);
    if (!moods.length) return null;
    const counts = moods.reduce((a, m) => { a[m] = (a[m] || 0) + 1; return a; }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  };

  const getInsight = () => {
    if (calories === 0) return { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100', msg: "Start logging your meals to get personalized insights!" };
    if (pct >= 100)     return { icon: TrendingUp, color: 'text-rose-500',  bg: 'bg-rose-50 border-rose-100',   msg: "You've hit your calorie goal! Consider a light walk to balance it out." };
    if (protein < 20)   return { icon: TrendingDown,color:'text-blue-500',  bg: 'bg-blue-50 border-blue-100',   msg: "You're low on protein today. Try adding eggs, chicken, or legumes to your next meal." };
    if (water < 4)      return { icon: Droplet,     color: 'text-cyan-500', bg: 'bg-cyan-50 border-cyan-100',   msg: "You're under-hydrated! Aim for at least 4 glasses (1L) before dinner." };
    if (pct > 50)       return { icon: TrendingUp,  color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100', msg: "Halfway through your calorie goal — great progress! Stay consistent." };
    return               { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100', msg: "Keep logging your meals to stay on track with your goal!" };
  };

  const macroData  = [
    { name: 'Protein', value: protein, color: MACRO_COLORS[0] },
    { name: 'Carbs',   value: carbs,   color: MACRO_COLORS[1] },
    { name: 'Fat',     value: fat,     color: MACRO_COLORS[2] },
  ];

  const pageVariants = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

  if (loading) return <div className="p-12 flex justify-center min-h-[100dvh] items-center"><Loader2 className="animate-spin text-primary" size={36} /></div>;
  if (error)   return <div className="p-6"><div className="p-4 glass-card text-rose-700 rounded-2xl flex items-center space-x-2 bg-rose-50/50"><AlertCircle size={20}/><span className="text-sm font-medium">{error}</span></div></div>;

  const insight     = getInsight();
  const InsightIcon = insight.icon;
  const topMood     = getTopMood();

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="p-5 pb-28 space-y-5 min-h-[100dvh]">

      {/* ── Header ── */}
      <div className="flex justify-between items-end mt-2 mb-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h2>
        {profile?.name && (
          <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primaryLight/60 px-4 py-1.5 rounded-full border border-primary/10">
            Hi, {profile.name} 👋
          </span>
        )}
      </div>

      {/* ── Stat Pills Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="glass-card p-4 rounded-3xl flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-orange-300 rounded-full blur-xl opacity-30"></div>
          <Flame size={20} className={`mb-1 z-10 ${streak > 0 ? 'fill-orange-500 text-orange-500 drop-shadow' : 'text-slate-300'}`} />
          <span className="text-2xl font-black text-slate-800 z-10">{streak}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 z-10">Day Streak</span>
        </motion.div>

        {/* Calories */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }} className="glass-card p-4 rounded-3xl flex flex-col items-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-emerald-300 rounded-full blur-xl opacity-30"></div>
          <Target size={20} className="mb-1 text-primary z-10" />
          <span className="text-2xl font-black text-slate-800 z-10">{Math.round(calories)}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 z-10">/ {target} kcal</span>
        </motion.div>

        {/* Mood */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="glass-card p-4 rounded-3xl flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-12 h-12 bg-blue-300 rounded-full blur-xl opacity-30"></div>
          <span className="text-2xl z-10 drop-shadow mb-1">{topMood || '😶'}</span>
          <span className="text-2xl font-black text-slate-800 z-10 opacity-0 select-none">·</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 z-10">Today's Mood</span>
        </motion.div>
      </div>

      {/* ── Calorie Progress Bar ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-300 rounded-full blur-3xl opacity-20"></div>
        <div className="flex justify-between items-baseline mb-4 relative z-10">
          <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Calorie Goal</h3>
          <span className="text-xs font-bold text-slate-400">{Math.round(pct)}% reached</span>
        </div>
        <div className="flex items-baseline space-x-2 mb-4 relative z-10">
          <span className="text-5xl font-black text-slate-800 tracking-tighter">{Math.round(calories)}</span>
          <span className="text-slate-400 font-bold">/ {target} kcal</span>
        </div>
        <div className="h-4 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner border border-white/50 relative z-10">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
            className={`h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] ${pct >= 100 ? 'bg-gradient-to-r from-rose-400 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-primary'}`}
          />
        </div>
      </motion.div>

      {/* ── Smart Insight Card ── */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className={`p-5 rounded-3xl border backdrop-blur-sm flex items-start space-x-4 shadow-sm ${insight.bg}`}>
        <div className={`p-2.5 rounded-2xl bg-white/70 shadow-sm shrink-0 ${insight.color}`}>
          <InsightIcon size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Today's Insight</p>
          <p className="font-bold text-slate-700 text-sm leading-relaxed">{insight.msg}</p>
        </div>
      </motion.div>

      {/* ── Meal Timeline ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-5">Today's Meal Timeline</h3>
        <div className="space-y-3">
          {MEAL_SLOTS.map(({ type, icon: Icon, time, color, bg, border }, i) => {
            const meals  = (logData.meals || []).filter(m => m.mealType === type);
            const logged = meals.length > 0;
            const kcal   = meals.reduce((s, m) => s + m.calories, 0);
            return (
              <div key={type} className="flex items-center space-x-4">
                {/* left column: icon + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border ${logged ? `${bg} ${border} ${color}` : 'bg-slate-100 border-slate-200 text-slate-300'}`}>
                    <Icon size={18} />
                  </div>
                  {i < MEAL_SLOTS.length - 1 && (
                    <div className={`w-0.5 h-4 mt-1 rounded-full ${logged ? 'bg-primary/30' : 'bg-slate-200'}`}></div>
                  )}
                </div>
                {/* content */}
                <div className={`flex-1 flex justify-between items-center p-3 rounded-2xl border ${logged ? `${bg} ${border}` : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`text-sm font-black ${logged ? 'text-slate-800' : 'text-slate-400'}`}>{type}</p>
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {logged
                      ? <><span className={`text-sm font-black ${color}`}>{Math.round(kcal)} kcal</span><CheckCircle2 className="text-primary" size={18}/></>
                      : <><span className="text-xs font-bold text-slate-300">Not logged</span><Circle className="text-slate-200" size={18}/></>
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Weekly Trend Chart ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-300 rounded-full blur-3xl opacity-20"></div>
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-1">7-Day Calorie Trend</h3>
        <p className="text-xs text-slate-400 font-medium mb-5">Your intake vs. daily goal this week</p>

        {weeklyData.every(d => d.calories === 0) ? (
          <div className="flex flex-col items-center py-8 text-center">
            <TrendingUp className="text-slate-200 mb-3" size={40} />
            <p className="text-slate-400 font-bold text-sm">Log meals for a few days to see your trend.</p>
          </div>
        ) : (
          <div className="h-44 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="goal"     stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="none" dot={false} />
                <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fill="url(#calGrad)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* ── Macros Donut ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-5">Macros Breakdown</h3>
        {calories === 0 ? (
          <p className="text-center text-slate-400 italic font-medium py-6">Log meals to see your macros.</p>
        ) : (
          <div className="flex items-center justify-between">
            <div className="w-36 h-36 drop-shadow-xl">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                    {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 pl-5 space-y-3">
              {macroData.map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-white/40 px-3 py-2 rounded-xl border border-white/50 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{m.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{Math.round(m.value)}g</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Water Tracker ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-blue-300 rounded-full blur-3xl opacity-20"></div>

        <div className="flex justify-between items-start mb-1 relative z-10">
          <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center"><Droplet className="text-blue-500 mr-1.5" size={14}/>Water Intake</h3>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${water >= 8 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            {water}/8 glasses
          </span>
        </div>

        {/* ml info */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="text-2xl font-black text-slate-800">{waterMl}<span className="text-sm font-bold text-slate-400 ml-1">ml</span></span>
          <span className="text-xs font-bold text-slate-400">Goal: 2,000 ml</span>
        </div>

        {/* thin progress */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5 relative z-10 border border-white/50">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${(water / 8) * 100}%` }} transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
          />
        </div>

        {/* glass icons */}
        <div className="grid grid-cols-8 gap-1 relative z-10">
          {[...Array(8)].map((_, i) => (
            <button
              key={i}
              onClick={() => handleWaterClick(i)}
              title={`${(i + 1) * 250} ml`}
              className={`flex flex-col items-center transition-all duration-300 ${i < water ? 'text-blue-500 scale-110 drop-shadow-[0_4px_8px_rgba(59,130,246,0.5)]' : 'text-slate-300 hover:text-blue-200'}`}
            >
              <Droplet size={22} className={i < water ? 'fill-blue-500' : ''} />
              <span className="text-[8px] font-bold mt-0.5 opacity-70">{(i+1)*250}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-center text-slate-400 font-medium mt-3 relative z-10">Each glass = 250 ml · Tap to track</p>
      </motion.div>

    </motion.div>
  );
}
