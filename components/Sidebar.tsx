'use client';

import { motion } from 'framer-motion';

type Module =
  | 'dashboard'
  | 'patient'
  | 'scan'
  | 'diagnosis'
  | 'treatment'
  | 'score'
  | 'tooth3d'
  | 'simulation';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
}

const navItems: { id: Module; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'patient',
    label: 'Patient Profile',
    shortLabel: 'Patient',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: 'scan',
    label: 'Scan Viewer',
    shortLabel: 'Scan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
        <path d="M10 12h4M12 10v4" strokeOpacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'diagnosis',
    label: 'Diagnosis',
    shortLabel: 'Dx',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M9 12h6M12 9v6" />
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" strokeOpacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'treatment',
    label: 'Treatment Journey',
    shortLabel: 'Journey',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M3 12h18M3 12l4-4M3 12l4 4" strokeOpacity="0.4"/>
        <circle cx="8" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="14" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="20" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
        <path d="M8 8v-2M14 8V6M20 8V6" />
      </svg>
    ),
  },
  {
    id: 'score',
    label: 'Health Score',
    shortLabel: 'Score',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: 'tooth3d',
    label: '3D Tooth Model',
    shortLabel: '3D',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M12 3C9 3 7 5 7 7.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 4 0 1.5.5 3 1.5 4s2 1 2.5 1 1.5-.5 2.5-1 1.5-2.5 1.5-4c0-2 .5-3 1-4 .5-1 1-2 1-3.5C18 5 16 3 12 3z" />
        <path d="M9 8c0-1.5 1-3 3-3M12 3v2" strokeOpacity="0.4" />
        <ellipse cx="12" cy="16" rx="2" ry="1.5" strokeOpacity="0.35" />
      </svg>
    ),
  },
  {
    id: 'simulation',
    label: 'Future Simulation',
    shortLabel: 'Sim',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M3 17l4-8 4 5 3-3 4 6" />
        <path d="M3 20h18" strokeOpacity="0.3" />
        <circle cx="7" cy="9" r="1" fill="currentColor" />
        <circle cx="11" cy="14" r="1" fill="currentColor" />
        <circle cx="14" cy="11" r="1" fill="currentColor" />
        <circle cx="18" cy="17" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full w-[72px] border-r shrink-0"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-8 h-8"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tracking-tight"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            FP
          </div>
          <div
            className="absolute inset-0 rounded-lg"
            style={{ boxShadow: '0 0 12px var(--accent-glow)' }}
          />
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 py-4 flex-1">
        {navItems.map((item, i) => {
          const isActive = activeModule === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onModuleChange(item.id)}
              title={item.label}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group"
              style={{
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>

              {/* Tooltip */}
              <span
                className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom: session indicator */}
      <div className="flex flex-col items-center pb-4 gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
        />
        <span className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Live</span>
      </div>
    </aside>
  );
}
