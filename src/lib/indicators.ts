import { CandleData, TechnicalIndicators } from '@/types/crypto';
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
    unused: candle[11]
  }));
}

export function calculateIndicators(data: CandleData[]): TechnicalIndicators {
  // Convert string prices to numbers and ensure they're in chronological order
  const closes = data
    .sort((a, b) => a.openTime - b.openTime)
    .map(d => parseFloat(d.close));
  
  // Calculate MACD
  const macdInput = {
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  };
  
  const macd = MACD.calculate(macdInput);
  
  // Pad the beginning of the arrays with null values to match the original data length
  const padLength = closes.length - macd.length;
  const paddedMACD = Array(padLength).fill(null).concat(macd.map(m => m.MACD));
  const paddedSignal = Array(padLength).fill(null).concat(macd.map(m => m.signal));
  const paddedHistogram = Array(padLength).fill(null).concat(macd.map(m => m.histogram));
  
  // Calculate RSI
  const rsiInput = {
    values: closes,
    period: 14
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