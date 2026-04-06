'use client';

import { motion } from 'framer-motion';

type Module =
  | 'dashboard' | 'patient' | 'scan' | 'diagnosis'
  | 'treatment' | 'score'   | 'tooth3d' | 'simulation';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
}

const navItems: { id: Module; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>,
  },
  {
    id: 'patient', label: 'Patient Profile',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.9 3.4-7 7.5-7s7.5 3.1 7.5 7" strokeLinecap="round" />
    </svg>,
  },
  {
    id: 'scan', label: 'Scan Viewer',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
      <rect x="7.5" y="7.5" width="9" height="9" rx="1" />
    </svg>,
  },
  {
    id: 'diagnosis', label: 'Diagnosis',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
  },
  {
    id: 'treatment', label: 'Treatment Journey',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
      <path d="M7 12h3M14 12h3" strokeLinecap="round" />
    </svg>,
  },
  {
    id: 'score', label: 'Health Score',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
  },
  {
    id: 'tooth3d', label: '3D Tooth Model',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <path d="M12 3C9 3 7 5 7 7.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 4 0 1.5.5 3 1.5 4s2 1 2.5 1 1.5-.5 2.5-1 1.5-2.5 1.5-4c0-2 .5-3 1-4 .5-1 1-2 1-3.5C18 5 16 3 12 3z" />
    </svg>,
  },
  {
    id: 'simulation', label: 'Future Simulation',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-[18px] h-[18px]">
      <path d="M3 17l4-8 4 5 3-3 4 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" strokeOpacity="0.3" strokeLinecap="round" />
    </svg>,
  },
];

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full shrink-0"
      style={{
        width: 68,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: 64, borderBottom: '1px solid var(--border)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold tracking-tight select-none"
            style={{
              background: 'linear-gradient(145deg, #00d4aa 0%, #009e7f 100%)',
              color: '#000',
              boxShadow: '0 0 18px rgba(0,212,170,0.3), 0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            FP
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-0.5 py-3 flex-1">
        {navItems.map((item, i) => {
          const isActive = activeModule === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="relative w-full flex items-center justify-center"
            >
              {/* Active left bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{
                    width: 3,
                    height: 24,
                    background: 'linear-gradient(to bottom, var(--accent-bright), var(--accent))',
                    boxShadow: '2px 0 14px rgba(0,212,170,0.55)',
                  }}
                  transition={{ type: 'spring', stiffness: 480, damping: 32 }}
                />
              )}

              <button
                onClick={() => onModuleChange(item.id)}
                title={item.label}
                className="group relative mx-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150"
                style={{
                  background: isActive ? 'var(--accent-dim-strong)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {/* hover fill */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: isActive ? 'transparent' : 'rgba(255,255,255,0.04)' }}
                />
                <span className="relative z-10 transition-colors duration-100 group-hover:text-[var(--text-secondary)]">
                  {item.icon}
                </span>

                {/* Tooltip */}
                <div
                  className="absolute left-full ml-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50"
                  style={{ whiteSpace: 'nowrap', transform: 'translateY(-50%)', top: '50%' }}
                >
                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: 'var(--bg-overlay)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-strong)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom: live pill */}
      <div className="flex flex-col items-center pb-4 gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full pulse-dot"
          style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(0,212,170,0.7)' }}
        />
        <span className="text-[8px] tracking-[0.2em] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
          Live
        </span>
      </div>
    </aside>
  );
}
