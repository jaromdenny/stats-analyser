import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChartTimeRange {
  start: number;
  end: number;
}

interface ChartContextType {
  timeRange: ChartTimeRange | null;
  setTimeRange: (range: ChartTimeRange | null) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export function ChartProvider({ children }: { children: ReactNode }) {
  const [timeRange, setTimeRange] = useState<ChartTimeRange | null>(null);

  return (
    <ChartContext.Provider value={{ timeRange, setTimeRange }}>
      {children}
    </ChartContext.Provider>
  );
}

export function useChartContext() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
} 