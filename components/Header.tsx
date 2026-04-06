'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockPatient, mockDiagnoses } from '@/lib/mockData';

type Module = 'dashboard' | 'patient' | 'scan' | 'diagnosis' | 'treatment' | 'score' | 'tooth3d' | 'simulation' | 'story';

const moduleTitles: Record<Module, string> = {
  dashboard:  'Overview',
  patient:    'Patient Profile',
  scan:       'Scan Viewer',
  diagnosis:  'Diagnosis Panel',
  treatment:  'Treatment Journey',
  score:      'Oral Health Score',
  tooth3d:    '3D Tooth Model',
  simulation: 'Future Simulation',
  story:      'Consultation Story Mode',
};

interface HeaderProps {
  activeModule: Module;
  onExplainToPatient: () => void;
}

const urgentDx = mockDiagnoses.find(d => d.urgency === 'soon');

export default function Header({ activeModule, onExplainToPatient }: HeaderProps) {
  const [time, setTime] = useState('');
  const [sessionSec, setSessionSec] = useState(0);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    tick();
    const c = setInterval(tick, 1000);
    const s = setInterval(() => setSessionSec(x => x + 1), 1000);
    return () => { clearInterval(c); clearInterval(s); };
  }, []);

  const mm = String(Math.floor(sessionSec / 60)).padStart(2, '0');
  const ss = String(sessionSec % 60).padStart(2, '0');

  return (
    <header className="flex items-center justify-between px-6 shrink-0"
      style={{ height: 64, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>

      {/* Left — module title */}
      <div className="flex items-center gap-3">
        <motion.span
          key={activeModule}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[15px] font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {moduleTitles[activeModule]}
        </motion.span>
        {urgentDx && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,217,102,0.08)', border: '1px solid rgba(255,217,102,0.2)' }}>
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--warning)' }} />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--warning)' }}>
              {urgentDx.plainEnglishName}
            </span>
          </div>
        )}
      </div>

      {/* Center — patient */}
      <div className="flex items-center gap-3 px-5 py-2 rounded-full"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
          {mockPatient.avatar}
        </div>
        <div>
          <p className="text-[13px] font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
            {mockPatient.name}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {mockPatient.age} yrs · {mockPatient.id} · {mockDiagnoses.length} findings
          </p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full ml-1 pulse-dot"
          style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(0,255,179,0.7)' }} />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onExplainToPatient}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold tracking-wide"
          style={{
            background: 'var(--accent)',
            color: '#000',
            boxShadow: '0 0 24px rgba(0,255,179,0.35)',
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z"/>
            <path d="M8 5.5v3M8 10.5v.5" strokeLinecap="round"/>
          </svg>
          Explain to Patient
        </motion.button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div className="w-1 h-1 rounded-full" style={{ background: '#FFD966' }} />
          <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            {mm}:{ss}
          </span>
        </div>
        <span className="text-[13px] font-mono" style={{ color: 'var(--text-muted)' }}>{time}</span>
        <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-opacity hover:opacity-70"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          End Session
        </button>
      </div>
    </header>
  );
}
