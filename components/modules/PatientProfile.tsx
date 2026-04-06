'use client';

import { motion } from 'framer-motion';
import { mockPatient, mockHealthScore } from '@/lib/mockData';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const anxietyConfig = {
  low: { label: 'Low Anxiety', color: 'var(--accent)', width: '25%' },
  moderate: { label: 'Moderate Anxiety', color: '#ffa502', width: '55%' },
  high: { label: 'High Anxiety', color: '#ff4757', width: '85%' },
};

const literacyConfig = {
  low: { label: 'Basic', desc: 'Use simple analogies, visuals first' },
  medium: { label: 'Intermediate', desc: 'Some medical terms OK, explain jargon' },
  high: { label: 'Advanced', desc: 'Clinical detail preferred' },
};

export default function PatientProfile() {
  const anxiety = anxietyConfig[mockPatient.anxietyLevel];
  const literacy = literacyConfig[mockPatient.healthLiteracyLevel];

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-5">

        {/* Profile hero */}
        <motion.div
          variants={item}
          className="rounded-xl p-6 flex items-center gap-6"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
            >
              {mockPatient.avatar}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
              style={{ background: 'var(--accent)', borderColor: 'var(--bg-elevated)' }}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {mockPatient.name}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {mockPatient.age} years old · {mockPatient.gender}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                {mockPatient.id}
              </span>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Phone</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mockPatient.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Email</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mockPatient.email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Insurance</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mockPatient.insuranceProvider}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Next Appt</p>
                <p className="text-sm" style={{ color: 'var(--accent)' }}>{mockPatient.nextAppointment}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Health Score</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--accent)' }}>{mockHealthScore.overall}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{mockHealthScore.tier}</p>
          </div>
        </motion.div>

        {/* Consultation intelligence */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            variants={item}
            className="rounded-xl p-5 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Consultation Intelligence
            </h2>

            {/* Anxiety meter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Dental Anxiety</span>
                <span className="text-xs font-medium" style={{ color: anxiety.color }}>{anxiety.label}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: anxiety.width }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: anxiety.color }}
                />
              </div>
            </div>

            {/* Health literacy */}
            <div
              className="p-3 rounded-lg"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Health Literacy</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                  {literacy.label}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{literacy.desc}</p>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Preferred Language</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{mockPatient.preferredLanguage}</span>
            </div>
          </motion.div>

          {/* Alerts / flags */}
          <motion.div
            variants={item}
            className="rounded-xl p-5 space-y-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Clinical Flags
            </h2>
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)' }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff4757' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#ff4757' }}>Allergy: Penicillin</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Verify before prescribing antibiotics</p>
              </div>
            </div>
            {mockPatient.medications.map((med) => (
              <div
                key={med}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{med}</p>
              </div>
            ))}
            {mockPatient.healthHistory.map((h) => (
              <div
                key={h}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ffa502' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{h}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visit history timeline */}
        <motion.div
          variants={item}
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Visit History
          </h2>
          <div className="flex items-stretch gap-0">
            {[
              { date: 'Aug 2025', type: 'New Patient Exam', score: 52, note: 'Initial full exam + X-rays' },
              { date: 'Sep 2025', type: 'Cleaning', score: 58, note: 'Prophylaxis, fluoride' },
              { date: 'Oct 2025', type: 'Review', score: 61, note: 'Gum assessment follow-up' },
              { date: 'Nov 2025', type: 'Restoration', score: 65, note: 'Filling #19 completed' },
              { date: 'Today', type: 'Consultation', score: 67, note: 'Cavity review + treatment plan', isActive: true },
            ].map((visit, i, arr) => (
              <div key={i} className="flex-1 flex flex-col">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 z-10"
                    style={{
                      background: visit.isActive ? 'var(--accent)' : 'var(--border)',
                      boxShadow: visit.isActive ? '0 0 10px var(--accent)' : 'none',
                    }}
                  />
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  )}
                </div>
                <div className="mt-3 pr-2">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: visit.isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {visit.date}
                  </p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{visit.type}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{visit.note}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: 'var(--accent)' }}>{visit.score}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
