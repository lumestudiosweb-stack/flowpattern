'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockPatient } from '@/lib/mockData';

type Module = 'dashboard' | 'patient' | 'scan' | 'diagnosis' | 'treatment' | 'score' | 'tooth3d' | 'simulation';

const moduleTitles: Record<Module, string> = {
  dashboard:  'Overview',
  patient:    'Patient Profile',
  scan:       'Scan Overlay Visualization',
  diagnosis:  'AI Diagnosis Explanation',
  treatment:  'Treatment Journey',
  score:      'Dental Health Score',
  tooth3d:    '3D Tooth Model',
  simulation: 'Oral Health Future Simulation',
};

interface HeaderProps {
  activeModule: Module;
  onExplainToPatient: () => void;
}

export default function Header({ activeModule, onExplainToPatient }: HeaderProps) {
  const [time, setTime] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    tick();
    const clockId = setInterval(tick, 1000);
    const sessionId = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => { clearInterval(clockId); clearInterval(sessionId); };
  }, []);

  const mm = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
  const ss = String(sessionSeconds % 60).padStart(2, '0');

  return (
    <header
      className="flex items-center justify-between px-5 shrink-0"
      style={{
        height: 64,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Left — breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="text-[11px] tracking-[0.16em] uppercase font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          FlowPattern
        </span>
        <span style={{ color: 'var(--border-strong)', fontSize: 16, lineHeight: 1 }}>/</span>
        <motion.span
          key={activeModule}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {moduleTitles[activeModule]}
        </motion.span>
      </div>

      {/* Center — patient identity pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-2 rounded-full"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,170,0.25) 0%, rgba(0,212,170,0.12) 100%)',
            color: 'var(--accent)',
            border: '1.5px solid var(--accent-glow)',
          }}
        >
          {mockPatient.avatar}
        </div>
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {mockPatient.name}
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {mockPatient.age} yrs · {mockPatient.id} · {mockPatient.insuranceProvider}
          </span>
        </div>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
        <div
          className="w-1.5 h-1.5 rounded-full pulse-dot"
          style={{ background: 'var(--accent)', boxShadow: '0 0 5px rgba(0,212,170,0.7)' }}
        />
      </motion.div>

      {/* Right — actions + clock */}
      <div className="flex items-center gap-3">
        {/* Explain to Patient */}
        <motion.button
          onClick={onExplainToPatient}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #00d4aa 0%, #009e7f 100%)',
            color: '#000',
            boxShadow: '0 0 20px rgba(0,212,170,0.3), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" />
            <path d="M10 6v4M10 12v.5" strokeLinecap="round" />
          </svg>
          Explain to Patient
        </motion.button>

        {/* Session timer */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ffaa00' }} />
          <span className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
            {mm}:{ss}
          </span>
        </div>

        {/* Clock */}
        <div
          className="text-[13px] font-mono font-medium tracking-[0.12em]"
          style={{ color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}
        >
          {time}
        </div>

        {/* End Session */}
        <button
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium tracking-wide transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          End Session
        </button>
      </div>
    </header>
  );
}
