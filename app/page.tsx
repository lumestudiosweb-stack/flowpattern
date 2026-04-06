'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/modules/Dashboard';
import PatientProfile from '@/components/modules/PatientProfile';
import ScanViewer from '@/components/modules/ScanViewer';
import DiagnosisPanel from '@/components/modules/DiagnosisPanel';
import TreatmentJourney from '@/components/modules/TreatmentJourney';
import HealthScore from '@/components/modules/HealthScore';
import ToothModel3D from '@/components/modules/ToothModel3D';

type Module = 'dashboard' | 'patient' | 'scan' | 'diagnosis' | 'treatment' | 'score' | 'tooth3d';

const moduleVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function FlowPattern() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':  return <Dashboard onModuleChange={setActiveModule} />;
      case 'patient':    return <PatientProfile />;
      case 'scan':       return <ScanViewer />;
      case 'diagnosis':  return <DiagnosisPanel />;
      case 'treatment':  return <TreatmentJourney />;
      case 'score':      return <HealthScore />;
      case 'tooth3d':    return <ToothModel3D />;
    }
  };

  return (
    <div className="flex h-full" style={{ background: 'var(--bg-base)' }}>
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header activeModule={activeModule} />

        <main className="flex-1 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              variants={moduleVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
