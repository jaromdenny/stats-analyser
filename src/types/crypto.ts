export interface CandleData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  unused: string;
}

export interface TechnicalIndicators {
  macd: {
    MACD: number[];
    signal: number[];
    histogram: number[];
  };
  rsi: number[];
} 