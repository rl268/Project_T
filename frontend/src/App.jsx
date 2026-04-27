import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Profile from './pages/Profile';
import LogMeal from './pages/LogMeal';
import Dashboard from './pages/Dashboard';
import Suggestions from './pages/Suggestions';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/log" element={<LogMeal />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suggestions" element={<Suggestions />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-100 flex justify-center overflow-hidden font-sans text-slate-800 relative">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20 z-0"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl min-h-screen relative z-10 shadow-2xl overflow-y-auto pb-24 ring-1 ring-white/50">
          <AnimatedRoutes />
          <Navigation />
        </div>
      </div>
    </Router>
  );
}
