import { useState, useEffect } from 'react';
import { StrategyConfig, Trade, TradeHistory } from '@/types/trading';
import { TradingStrategy } from '@/lib/tradingStrategy';
import { CandleData } from '@/types/crypto';

interface TradingStrategyPanelProps {
  data: CandleData[];
}

export function TradingStrategyPanel({ data }: TradingStrategyPanelProps) {
  const [config, setConfig] = useState<StrategyConfig>({
    rsiPeriod: 6,
    rsiOverbought: 75,
    rsiOversold: 25,
    rsiExtremeOversold: 15,
    rsiExtremeOverbought: 85,
    macdFastPeriod: 12,
    macdSlowPeriod: 26,
    macdSignalPeriod: 9,
    allowedCoinBalance: 1000,
    initialBalance: 10000,
    partialFillTolerance: 5
  });

  const [results, setResults] = useState<TradeHistory>({
    trades: [],
    currentBalance: config.initialBalance,
    totalProfitLoss: 0,
    winCount: 0,
    lossCount: 0
  });

  useEffect(() => {
    const strategy = new TradingStrategy(config);
    const simulationResults = strategy.simulate(data);
    setResults(simulationResults);
  }, [config, data]);

  const handleConfigChange = (key: keyof StrategyConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Trading Strategy Configuration</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">RSI Period</label>
          <input
            type="number"
            value={config.rsiPeriod}
            onChange={(e) => handleConfigChange('rsiPeriod', Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">RSI Overbought</label>
          <input
            type="number"
            value={config.rsiOverbought}
            onChange={(e) => handleConfigChange('rsiOverbought', Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">RSI Oversold</label>
          <input
            type="number"
            value={config.rsiOversold}
            onChange={(e) => handleConfigChange('rsiOversold', Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Allowed Coin Balance</label>
          <input
            type="number"
            value={config.allowedCoinBalance}
            onChange={(e) => handleConfigChange('allowedCoinBalance', Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Strategy Performance</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Total Profit/Loss</div>
            <div className="text-lg font-semibold">${results.totalProfitLoss.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Current Balance</div>
            <div className="text-lg font-semibold">${results.currentBalance.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Win Rate</div>
            <div className="text-lg font-semibold">
              {((results.winCount / (results.winCount + results.lossCount)) * 100 || 0).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Total Trades</div>
            <div className="text-lg font-semibold">{results.trades.length}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Trade History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      trade.action === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${trade.coinPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.coinAmount.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${trade.usdPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.profitLoss && (
                      <span className={`${
                        trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${trade.profitLoss.toFixed(2)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 