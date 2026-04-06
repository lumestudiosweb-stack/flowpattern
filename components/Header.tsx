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
    const clockInterval = setInterval(tick, 1000);
    const sessionInterval = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => { clearInterval(clockInterval); clearInterval(sessionInterval); };
  }, []);

  const sessionTime = `${String(Math.floor(sessionSeconds / 60)).padStart(2, '0')}:${String(sessionSeconds % 60).padStart(2, '0')}`;

  return (
    <header
      className="flex items-center justify-between px-6 h-16 border-b shrink-0"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          FlowPattern
        </span>
        <span style={{ color: 'var(--border)' }}>/</span>
        <motion.span
          key={activeModule}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {moduleTitles[activeModule]}
        </motion.span>
      </div>

      {/* Center: patient pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 px-4 py-2 rounded-full"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
        >
          {mockPatient.avatar}
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{mockPatient.name}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {mockPatient.age} yrs · {mockPatient.id}
          </span>
        </div>
        <div
          className="w-1.5 h-1.5 rounded-full ml-1"
          style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
        />
      </motion.div>

      {/* Right: explain button + time + session */}
      <div className="flex items-center gap-4">
        {/* Explain to Patient button */}
        <motion.button
          onClick={onExplainToPatient}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all"
          style={{
            background: 'var(--accent)',
            color: '#000',
            boxShadow: '0 0 16px rgba(0,212,170,0.35)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" />
            <path d="M12 3v13M8 7l4-4 4 4" />
          </svg>
          Explain to Patient
        </motion.button>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ffa502' }} />
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            Session {sessionTime}
          </span>
        </div>
        <div
          className="text-sm font-mono tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {time}
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide cursor-pointer transition-all"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          End Session
        </div>
      </div>
    </header>
  );
}
