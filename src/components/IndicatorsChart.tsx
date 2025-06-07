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
  const chartData = {
    labels: data.map(d => new Date(d.openTime)),
    datasets: type === 'MACD' ? [
      {
        label: 'MACD',
        data: data.map((d, i) => ({
          x: new Date(d.openTime),
          y: indicators.macd.MACD[i]
        })),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        spanGaps: true,
      },
      {
        label: 'Signal',
        data: data.map((d, i) => ({
          x: new Date(d.openTime),
          y: indicators.macd.signal[i]
        })),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        spanGaps: true,
      },
      {
        label: 'Histogram',
        data: data.map((d, i) => ({
          x: new Date(d.openTime),
          y: indicators.macd.histogram[i]
        })),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
        spanGaps: true,
      },
    ] : [
      {
        label: 'RSI',
        data: data.map((d, i) => ({
          x: new Date(d.openTime),
          y: indicators.rsi[i]
        })),
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