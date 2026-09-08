import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { ShowcaseOverlay } from './components/layout/ShowcaseOverlay';

// Core Streamlined Views
import { LandingPage } from './components/views/LandingPage';
import { CommandCenter } from './components/views/CommandCenter';
import { PredictionPage } from './components/views/PredictionPage';
import { LiveMapPage } from './components/views/LiveMapPage';
import { SimulationPage } from './components/views/SimulationPage';
import { EvacuationPage } from './components/views/EvacuationPage';
import { AlertsPage } from './components/views/AlertsPage';
import { AuthPage } from './components/views/AuthPage';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useSimulation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [showLanding, setShowLanding] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (showLanding) {
    return <LandingPage onEnter={(tab) => { setShowLanding(false); setActiveTab(tab || 'command-center'); }} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'command-center':
        return <CommandCenter />;
      case 'prediction':
        return <PredictionPage />;
      case 'flood-map':
        return <LiveMapPage />;
      case 'simulation':
        return <SimulationPage />;
      case 'evacuation':
        return <EvacuationPage />;
      case 'alerts':
        return <AlertsPage />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#030712] overflow-hidden select-none">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <Navigation />

        <main className="flex-1 overflow-hidden relative bg-[#030712]">
          {renderActiveView()}
        </main>
      </div>

      <ShowcaseOverlay />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <MainAppContent />
    </SimulationProvider>
  );
};

export default App;
