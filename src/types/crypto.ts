export interface CandleData {
  openTime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: string;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignore: string;
  coinId: string;
}

export interface TechnicalIndicators {
  macd: {
    MACD: number[];
    signal: number[];
    histogram: number[];
  };
  rsi: number[];
} 