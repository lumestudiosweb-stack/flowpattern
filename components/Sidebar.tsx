'use client';

import { motion } from 'framer-motion';

type Module =
  | 'dashboard' | 'patient' | 'scan' | 'diagnosis'
  | 'treatment' | 'score'   | 'tooth3d' | 'simulation' | 'story';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
}

const NAV: { id: Module; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Dashboard', sub: 'Overview',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="12" y="2" width="6" height="6" rx="1.5"/>
      <rect x="2" y="12" width="6" height="6" rx="1.5"/><rect x="12" y="12" width="6" height="6" rx="1.5"/>
    </svg>,
  },
  {
    id: 'patient', label: 'Patient Profile', sub: 'Demographics & history',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <circle cx="10" cy="7" r="3"/><path d="M3.5 17c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" strokeLinecap="round"/>
    </svg>,
  },
  {
    id: 'scan', label: 'Scan Viewer', sub: 'X-ray & overlay',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path d="M2.5 6V4a1.5 1.5 0 011.5-1.5H6M14 2.5h2a1.5 1.5 0 011.5 1.5V6M17.5 14v2a1.5 1.5 0 01-1.5 1.5h-2M6 17.5H4A1.5 1.5 0 012.5 16v-2"/>
      <rect x="6" y="6" width="8" height="8" rx="1"/>
    </svg>,
  },
  {
    id: 'diagnosis', label: 'Diagnosis Panel', sub: 'AI-assisted findings',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <circle cx="10" cy="10" r="7.5"/><path d="M10 6.5v3.5M10 13.5h.01" strokeLinecap="round"/>
    </svg>,
  },
  {
    id: 'simulation', label: 'Future Simulation', sub: 'Treated vs untreated',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path d="M2 14l3.5-7 3.5 4.5 2.5-2.5 3.5 5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17h16" strokeOpacity="0.3" strokeLinecap="round"/>
    </svg>,
  },
  {
    id: 'treatment', label: 'Treatment Journey', sub: 'Care phases & steps',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <circle cx="4" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="16" cy="10" r="2"/>
      <path d="M6 10h2M12 10h2" strokeLinecap="round"/>
    </svg>,
  },
  {
    id: 'score', label: 'Oral Health Score', sub: '6-dimension rating',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <circle cx="10" cy="10" r="7.5"/>
      <path d="M10 6v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
  },
  {
    id: 'story', label: 'Story Mode', sub: 'Consultation presentation',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path d="M10 2.5L12.5 8h6l-5 3.5 2 6.5-5.5-4-5.5 4 2-6.5-5-3.5h6z" strokeLinejoin="round"/>
    </svg>,
  },
];

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full shrink-0"
      style={{
        width: 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: 64, borderBottom: '1px solid var(--border)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black tracking-tighter select-none shrink-0"
          style={{
            background: 'var(--accent)',
            color: '#000',
            boxShadow: '0 0 20px rgba(0,255,179,0.35)',
          }}
        >
          FP
        </motion.div>
        <div>
          <p className="text-[13px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>FlowPattern</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dental Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col py-3 flex-1 overflow-y-auto">
        {NAV.map((item, i) => {
          const isActive = activeModule === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="relative px-3"
            >
              {/* Active bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{ width: 3, height: 32, background: 'var(--accent)', boxShadow: '2px 0 16px rgba(0,255,179,0.55)' }}
                  transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                />
              )}
              <button
                onClick={() => onModuleChange(item.id)}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(0,255,179,0.08)' : 'transparent',
                }}
              >
                {/* Hover fill */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: isActive ? 'transparent' : 'rgba(255,255,255,0.03)' }} />
                <span className="relative z-10 flex-shrink-0 transition-colors duration-150"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                <div className="relative z-10 min-w-0">
                  <p className="text-[13px] font-semibold leading-tight truncate"
                    style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {item.label}
                  </p>
                  <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.sub}
                  </p>
                </div>
              </button>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom — live status */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="w-1.5 h-1.5 rounded-full pulse-dot flex-shrink-0"
          style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(0,255,179,0.8)' }} />
        <div>
          <p className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>Live Session</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dr. K. Wallace</p>
        </div>
      </div>
    </aside>
  );
}
