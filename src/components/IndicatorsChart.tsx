import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { CandleData, TechnicalIndicators } from '@/types/crypto';
import { useChartContext } from './ChartContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface IndicatorsChartProps {
  data: CandleData[];
  indicators: TechnicalIndicators;
  type: 'MACD' | 'RSI';
}

export function IndicatorsChart({ data, indicators, type }: IndicatorsChartProps) {
  const { timeRange } = useChartContext();
  
  // Filter data based on time range if available
  const filteredData = timeRange 
    ? data.filter(d => {
        const timestamp = new Date(d.openTime).getTime();
        return timestamp >= timeRange.start && timestamp <= timeRange.end;
      })
    : data;

  const chartData = {
    labels: filteredData.map(d => new Date(d.openTime)),
    datasets: type === 'MACD' ? [
      {
        label: 'MACD',
        data: filteredData.map((d, i) => {
          const originalIndex = data.findIndex(originalD => originalD.openTime === d.openTime);
          return {
            x: new Date(d.openTime),
            y: indicators.macd.MACD[originalIndex]
          };
        }),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        spanGaps: true,
      },
      {
        label: 'Signal',
        data: filteredData.map((d, i) => {
          const originalIndex = data.findIndex(originalD => originalD.openTime === d.openTime);
          return {
            x: new Date(d.openTime),
            y: indicators.macd.signal[originalIndex]
          };
        }),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        spanGaps: true,
      },
      {
        label: 'Histogram',
        data: filteredData.map((d, i) => {
          const originalIndex = data.findIndex(originalD => originalD.openTime === d.openTime);
          return {
            x: new Date(d.openTime),
            y: indicators.macd.histogram[originalIndex]
          };
        }),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
        spanGaps: true,
      },
    ] : [
      {
        label: 'RSI',
        data: filteredData.map((d, i) => {
          const originalIndex = data.findIndex(originalD => originalD.openTime === d.openTime);
          return {
            x: new Date(d.openTime),
            y: indicators.rsi[originalIndex]
          };
        }),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
        spanGaps: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: type,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        min: timeRange ? timeRange.start : undefined,
        max: timeRange ? timeRange.end : undefined,
      },
      y: {
        beginAtZero: false,
        ...(type === 'RSI' ? { min: 0, max: 100 } : {}),
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow">
      <Line data={chartData} options={options} />
    </div>
  );
} 