'use client';

import { useState, useEffect } from 'react';
import { PriceChart } from '@/components/PriceChart';
import { IndicatorsChart } from '@/components/IndicatorsChart';
import { TradingStrategyPanel } from '@/components/TradingStrategyPanel';
import { ChartProvider } from '@/components/ChartContext';
import { DateRangePicker } from '@/components/DateRangePicker';
import { processCandleData, calculateIndicators } from '@/lib/indicators';
import { getAvailableDatasets } from '@/lib/data';
import { CandleData, TechnicalIndicators } from '@/types/crypto';
import { StrategyConfig } from '@/types/trading';

export default function Home() {
  const [data, setData] = useState<CandleData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [availableDatasets, setAvailableDatasets] = useState<string[]>([]);

  // Default strategy config for chart indicators
  const defaultConfig: StrategyConfig = {
    rsiPeriod: 6,
    rsiOverbought: 65,
    rsiOversold: 45,
    rsiExtremeOversold: 30,
    rsiExtremeOverbought: 77,
    macdFastPeriod: 12,
    macdSlowPeriod: 26,
    macdSignalPeriod: 9,
    allowedCoinBalance: 1000,
    initialBalance: 10000,
    partialFillTolerance: 5,
    oversoldBuyPercentage: 30,
    extremeOversoldBuyPercentage: 40,
    overboughtSellPercentage: 100,
    extremeOverboughtSellPercentage: 100
  };

  useEffect(() => {
    const loadDatasets = async () => {
      const datasets = await getAvailableDatasets();
      setAvailableDatasets(datasets);
      if (datasets.length > 0) {
        setSelectedFile(datasets[0]);
      }
    };

    loadDatasets();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedFile) return;
      
      try {
        const response = await fetch(`/data/${selectedFile}`);
        const rawData = await response.json();
        const processedData = processCandleData(rawData);
        setData(processedData);
        setIndicators(calculateIndicators(processedData, defaultConfig));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [selectedFile]);

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(event.target.value);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Cryptocurrency Analysis</h1>
          <select
            value={selectedFile}
            onChange={handleDatasetChange}
            className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a dataset</option>
            {availableDatasets.map(dataset => <option key={dataset} value={dataset}>{dataset}</option>)}
          </select>
        </div>

        {data.length > 0 && (
          <ChartProvider>
            <DateRangePicker data={data} />
            <PriceChart data={data} />
            {indicators && (
              <>
                <IndicatorsChart data={data} indicators={indicators} type="MACD" />
                <IndicatorsChart data={data} indicators={indicators} type="RSI" />
              </>
            )}
            <TradingStrategyPanel data={data} />
          </ChartProvider>
        )}
      </div>
    </main>
  );
} 