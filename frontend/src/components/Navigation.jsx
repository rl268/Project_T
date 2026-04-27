import { NavLink } from 'react-router-dom';
import { Home, User, PlusCircle, LayoutDashboard, Lightbulb } from 'lucide-react';

export default function Navigation() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/log", icon: PlusCircle, label: "Log Meal" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/suggestions", icon: Lightbulb, label: "Suggestions" },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-50 p-4 pb-6">
      <nav className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex justify-around items-center h-[68px]">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                  isActive ? 'text-primary scale-110 font-bold' : 'text-slate-400 hover:text-primary/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-md' : ''} />
                  <span className="text-[10px] tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
