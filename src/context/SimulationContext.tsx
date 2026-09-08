import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  StormSimulationState,
  CalculatedIntelligence,
  NextAreaPrediction,
  RankedThreatArea,
  SaferAreaOption,
  EvacuationRoute,
  WarningAlert
} from '../types';
import {
  calculateIntelligence,
  getNextAreaPrediction,
  getRankedThreatAreas,
  getSaferAreas,
  getEvacuationRoute,
  getEarlyWarning,
  getNepalDistrictRisks,
  getForecastTimeline
} from '../utils/simulationPhysics';

interface SimulationContextType {
  state: StormSimulationState;
  intel: CalculatedIntelligence;
  nextAreaPrediction: NextAreaPrediction;
  rankedThreatAreas: RankedThreatArea[];
  saferAreas: SaferAreaOption[];
  evacuationRoute: EvacuationRoute;
  earlyWarning: WarningAlert;
  nepalDistrictRisks: import('../types').NepalDistrictRisk[];
  forecastTimeline: import('../types').ForecastTimelineStep[];
  showHistoricalHotspots: boolean;
  
  // Handlers
  updateState: (partial: Partial<StormSimulationState>) => void;
  applyPreset: (preset: StormSimulationState['preset']) => void;
  setTimelineMinute: (min: number) => void;
  setFutureOffsetHours: (hours: number) => void;
  toggleHistoricalHotspots: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const defaultState: StormSimulationState = {
  rainfall: 65,
  durationHours: 6,
  riverLevel: 3.4,
  soilSaturation: 78,
  drainageCapacity: 35,
  slopeDegrees: 28,
  timelineMinute: 0,
  futureOffsetHours: 0,
  preset: 'HEAVY',
  selectedRegion: 'Nepal Watershed',
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StormSimulationState>(defaultState);
  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [showHistoricalHotspots, setShowHistoricalHotspots] = useState<boolean>(true);

  // Derived intelligence & dynamic simulation cascade
  const intel = useMemo(() => calculateIntelligence(state), [state]);
  const nextAreaPrediction = useMemo(() => getNextAreaPrediction(state), [state]);
  const rankedThreatAreas = useMemo(() => getRankedThreatAreas(state), [state]);
  const saferAreas = useMemo(() => getSaferAreas(state), [state]);
  const evacuationRoute = useMemo(() => getEvacuationRoute(state), [state]);
  const earlyWarning = useMemo(() => getEarlyWarning(state), [state]);
  const nepalDistrictRisks = useMemo(() => getNepalDistrictRisks(state), [state]);
  const forecastTimeline = useMemo(() => getForecastTimeline(state), [state]);

  const updateState = (partial: Partial<StormSimulationState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const applyPreset = (preset: StormSimulationState['preset']) => {
    switch (preset) {
      case 'NORMAL':
        setState((prev) => ({
          ...prev,
          preset: 'NORMAL',
          rainfall: 20,
          riverLevel: 1.2,
          soilSaturation: 30,
          drainageCapacity: 70,
        }));
        break;
      case 'HEAVY':
        setState((prev) => ({
          ...prev,
          preset: 'HEAVY',
          rainfall: 65,
          riverLevel: 3.4,
          soilSaturation: 78,
          drainageCapacity: 35,
        }));
        break;
      case 'EXTREME':
        setState((prev) => ({
          ...prev,
          preset: 'EXTREME',
          rainfall: 100,
          riverLevel: 4.4,
          soilSaturation: 88,
          drainageCapacity: 15,
        }));
        break;
    }
  };

  const setTimelineMinute = (min: number) => {
    setState((prev) => ({ ...prev, timelineMinute: min }));
  };

  const setFutureOffsetHours = (hours: number) => {
    setState((prev) => ({ ...prev, futureOffsetHours: hours }));
  };

  return (
    <SimulationContext.Provider
      value={{
        state,
        intel,
        nextAreaPrediction,
        rankedThreatAreas,
        saferAreas,
        evacuationRoute,
        earlyWarning,
        nepalDistrictRisks,
        forecastTimeline,
        showHistoricalHotspots,
        updateState,
        applyPreset,
        setTimelineMinute,
        setFutureOffsetHours,
        toggleHistoricalHotspots: () => setShowHistoricalHotspots((prev) => !prev),
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
};
