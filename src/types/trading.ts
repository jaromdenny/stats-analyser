export interface Trade {
  id: number;
  timestamp: Date;
  coinId: string;
  usdPrice: number;
  action: 'BUY' | 'SELL';
  coinAmount: number;
  coinPrice: number;
  profitLoss?: number;
  partialFill?: boolean;
}

export interface StrategyConfig {
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  rsiExtremeOversold: number;
  rsiExtremeOverbought: number;
  macdFastPeriod: number;
  macdSlowPeriod: number;
  macdSignalPeriod: number;
  allowedCoinBalance: number;
  initialBalance: number;
  partialFillTolerance: number;
  oversoldBuyPercentage: number;
  extremeOversoldBuyPercentage: number;
  overboughtSellPercentage: number;
  extremeOverboughtSellPercentage: number;
}

export interface TradeHistory {
  trades: Trade[];
  currentBalance: number;
  totalProfitLoss: number;
  winCount: number;
  lossCount: number;
}

export interface WavePoint {
  timestamp: Date;
  value: number;
  isPeak: boolean;
  isTrough: boolean;
} 