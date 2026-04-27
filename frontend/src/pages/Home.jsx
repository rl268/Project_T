import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight } from 'lucide-react';

export default function Home() {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="min-h-[100dvh] flex flex-col justify-center items-center p-6 pb-24 relative overflow-hidden">
      
      <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="w-32 h-32 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex items-center justify-center mb-10 border border-white">
        <Leaf className="text-primary drop-shadow-md" size={64} />
      </motion.div>
      
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-5xl font-black text-slate-800 tracking-tight mb-4 text-center">
        Nutri<span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">Smart</span>
      </motion.h1>
      
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-slate-500 font-medium text-center mb-16 text-xl tracking-wide">
        Eat Smart. Live Better.
      </motion.p>
      
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="w-full px-4">
        <Link to="/profile" className="group relative w-full bg-gradient-to-r from-primary to-emerald-500 hover:from-primaryDark hover:to-primary text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 transition-all duration-300 active:scale-95 overflow-hidden">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 text-lg tracking-wide">Get Started</span>
          <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
