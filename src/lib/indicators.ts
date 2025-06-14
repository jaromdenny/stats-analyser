import { CandleData, TechnicalIndicators } from '@/types/crypto';
import { StrategyConfig } from '@/types/trading';
import { MACD, RSI } from 'technicalindicators';

export function processCandleData(rawData: any[]): CandleData[] {
  return rawData.map(candle => ({
    openTime: candle[0],
    open: candle[1],
    high: candle[2],
    low: candle[3],
    close: candle[4],
    volume: candle[5],
    closeTime: candle[6],
    quoteAssetVolume: candle[7],
    numberOfTrades: candle[8],
    takerBuyBaseAssetVolume: candle[9],
    takerBuyQuoteAssetVolume: candle[10],
    ignore: candle[11],
    coinId: 'BTCUSDT' // Default coin ID, should be passed as parameter
  }));
}

export function calculateIndicators(data: CandleData[], config: StrategyConfig): TechnicalIndicators {
  // Convert string prices to numbers and ensure they're in chronological order
  const closes = data
    .sort((a, b) => Number(a.openTime) - Number(b.openTime))
    .map(d => parseFloat(d.close));
  
  // Calculate MACD using configurable periods
  const macdInput = {
    values: closes,
    fastPeriod: config.macdFastPeriod,
    slowPeriod: config.macdSlowPeriod,
    signalPeriod: config.macdSignalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  };
  
  const macdResults = MACD.calculate(macdInput);
  
  // Pad the beginning of the arrays with null values to match the original data length
  const padLength = closes.length - macdResults.length;
  const paddedMACD = Array(padLength).fill(null).concat(macdResults.map(m => m.MACD));
  const paddedSignal = Array(padLength).fill(null).concat(macdResults.map(m => m.signal));
  const paddedHistogram = Array(padLength).fill(null).concat(macdResults.map(m => m.histogram));
  
  // Calculate RSI using configurable period
  const rsiInput = {
    values: closes,
    period: config.rsiPeriod
  };
  
  const rsi = RSI.calculate(rsiInput);
  const paddedRSI = Array(closes.length - rsi.length).fill(null).concat(rsi);
  
  return {
    macd: {
      MACD: paddedMACD,
      signal: paddedSignal,
      histogram: paddedHistogram
    },
    rsi: paddedRSI
  };
} 