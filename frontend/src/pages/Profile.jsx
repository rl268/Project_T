import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile, getProfile } from '../services/api';
import { Save, UserCircle, Loader2, AlertCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '', age: '', weight: '', height: '', goal: 'Maintain Health',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (data) setProfile(data);
      } catch (err) { 
        setError("Failed to load profile. Please make sure the backend is running.");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    let bmr = 10 * Number(profile.weight) + 6.25 * Number(profile.height) - 5 * Number(profile.age) + 5;
    let target = bmr * 1.2;
    if (profile.goal === 'Lose Weight') target -= 500;
    if (profile.goal === 'Gain Muscle') target += 500;
    
    try {
      await saveProfile({ ...profile, targetCalories: Math.round(target) });
      navigate('/dashboard');
    } catch (err) { 
      setError("Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  const getBmiDetails = (weight, height) => {
    if (!weight || !height) return null;
    const heightInM = Number(height) / 100;
    const bmi = Number(weight) / (heightInM * heightInM);
    if (isNaN(bmi) || bmi === Infinity || bmi === 0) return null;
    
    let color = "text-emerald-500";
    let bg = "bg-emerald-50/50 border-emerald-200/50";
    let label = "Normal";
    if (bmi < 18.5) { color = "text-blue-500"; bg = "bg-blue-50/50 border-blue-200/50"; label = "Underweight"; }
    else if (bmi >= 25 && bmi < 30) { color = "text-amber-500"; bg = "bg-amber-50/50 border-amber-200/50"; label = "Overweight"; }
    else if (bmi >= 30) { color = "text-rose-500"; bg = "bg-rose-50/50 border-rose-200/50"; label = "Obese"; }

    return { value: bmi.toFixed(1), color, bg, label };
  };

  const bmiData = getBmiDetails(profile.weight, profile.height);

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (loading) return <div className="p-12 flex justify-center min-h-[100dvh] items-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="p-6 pb-24 min-h-[100dvh]">
      <div className="flex items-center space-x-3 mb-8 mt-4">
        <UserCircle className="text-primary drop-shadow-sm" size={36} />
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Profile Setup</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 glass-card text-rose-600 rounded-2xl flex items-center space-x-2 border-rose-200/50 bg-rose-50/50">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {bmiData && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`mb-8 p-5 rounded-2xl border flex items-center justify-between shadow-lg backdrop-blur-md ${bmiData.bg}`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-white/60 shadow-sm ${bmiData.color}`}>
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your BMI</p>
              <p className={`font-black text-lg ${bmiData.color}`}>{bmiData.label}</p>
            </div>
          </div>
          <span className={`text-4xl font-black ${bmiData.color} drop-shadow-sm`}>{bmiData.value}</span>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 glass-card p-6 rounded-3xl">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
          <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none bg-white/50 shadow-inner text-slate-800 font-medium transition-all" placeholder="Your name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
            <input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none bg-white/50 shadow-inner text-slate-800 font-medium transition-all" placeholder="Years" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Height</label>
            <input type="number" name="height" value={profile.height} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none bg-white/50 shadow-inner text-slate-800 font-medium transition-all" placeholder="cm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weight</label>
          <input type="number" name="weight" value={profile.weight} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none bg-white/50 shadow-inner text-slate-800 font-medium transition-all" placeholder="kg" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Health Goal</label>
          <select name="goal" value={profile.goal} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none bg-white/50 shadow-inner text-slate-800 font-medium transition-all appearance-none cursor-pointer">
            <option value="Lose Weight">Lose Weight</option>
            <option value="Maintain Health">Maintain Health</option>
            <option value="Gain Muscle">Gain Muscle</option>
          </select>
        </div>
        
        <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primaryDark hover:to-primary text-white py-4 rounded-2xl font-bold shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all duration-300 active:scale-95 mt-8 disabled:opacity-70">
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span className="text-lg tracking-wide">{saving ? "Saving..." : "Save & Continue"}</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
