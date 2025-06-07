'use client';

import { useState, useEffect } from 'react';
import { PriceChart } from '@/components/PriceChart';
import { IndicatorsChart } from '@/components/IndicatorsChart';
import { processCandleData, calculateIndicators } from '@/lib/indicators';
import { getAvailableDatasets } from '@/lib/data';
import { CandleData, TechnicalIndicators } from '@/types/crypto';

export default function Home() {
  const [data, setData] = useState<CandleData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [availableDatasets, setAvailableDatasets] = useState<string[]>([]);

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
        setIndicators(calculateIndicators(processedData));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [selectedFile]);

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cryptocurrency Analysis</h1>
        
        <div className="mb-8">
          <label htmlFor="file-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Dataset
          </label>
          <select
            id="file-select"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {availableDatasets.map((dataset) => (
              <option key={dataset} value={dataset}>
                {dataset.replace('.json', '')}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-8">
          {data.length > 0 && (
            <>
              <PriceChart data={data} />
              {indicators && (
                <>
                  <IndicatorsChart data={data} indicators={indicators} type="MACD" />
                  <IndicatorsChart data={data} indicators={indicators} type="RSI" />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
} 