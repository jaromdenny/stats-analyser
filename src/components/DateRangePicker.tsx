import React from 'react';
import { useChartContext } from './ChartContext';
import { CandleData } from '@/types/crypto';

interface DateRangePickerProps {
  data: CandleData[];
}

export function DateRangePicker({ data }: DateRangePickerProps) {
  const { timeRange, setTimeRange } = useChartContext();

  if (data.length === 0) return null;

  // Get the full time range from the data
  const timestamps = data.map(d => new Date(d.openTime).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = new Date(e.target.value).getTime();
    const endTime = timeRange?.end || maxTime;
    setTimeRange({ start: startTime, end: endTime });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endTime = new Date(e.target.value).getTime();
    const startTime = timeRange?.start || minTime;
    setTimeRange({ start: startTime, end: endTime });
  };

  const handleReset = () => {
    setTimeRange(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toISOString().slice(0, 16);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Start Date:</label>
        <input
          type="datetime-local"
          value={timeRange ? formatDate(timeRange.start) : formatDate(minTime)}
          min={formatDate(minTime)}
          max={formatDate(maxTime)}
          onChange={handleStartDateChange}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">End Date:</label>
        <input
          type="datetime-local"
          value={timeRange ? formatDate(timeRange.end) : formatDate(maxTime)}
          min={formatDate(minTime)}
          max={formatDate(maxTime)}
          onChange={handleEndDateChange}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={handleReset}
        className="px-4 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Reset to Full Range
      </button>

      <div className="text-sm text-gray-600">
        {timeRange ? (
          <span>
            Showing: {new Date(timeRange.start).toLocaleString()} - {new Date(timeRange.end).toLocaleString()}
          </span>
        ) : (
          <span>
            Showing full dataset: {new Date(minTime).toLocaleString()} - {new Date(maxTime).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
} 