import { Trade, StrategyConfig, TradeHistory, WavePoint } from '@/types/trading';
import { CandleData } from '@/types/crypto';
import { calculateIndicators } from './indicators';

export class TradingStrategy {
  private config: StrategyConfig;
  private trades: Trade[] = [];
  private currentBalance: number;
  private coinBalance: number = 0;
  private lastBuyPrice: number = 0;
  private inLowWave: boolean = false;
  private lastMacdValue: number | null = null;
  private macdDirection: 'up' | 'down' | null = null;
  private rsiWave: number[] = [];

  constructor(config: StrategyConfig) {
    this.config = config;
    this.currentBalance = config.initialBalance;
  }

  private detectWavePoint(values: number[], currentIndex: number): boolean {
    if (currentIndex < 2) return false;
    
    const current = values[currentIndex];
    const previous = values[currentIndex - 1];
    const beforePrevious = values[currentIndex - 2];
    
    // Detect peak
    if (current < previous && previous > beforePrevious) return true;
    // Detect trough
    if (current > previous && previous < beforePrevious) return true;
    
    return false;
  }

  private updateMacdDirection(currentMacd: number) {
    if (this.lastMacdValue === null) {
      this.lastMacdValue = currentMacd;
      return;
    }

    if (currentMacd > this.lastMacdValue) {
      if (this.macdDirection === 'down') {
        // Direction changed from down to up - trough detected
        return true;
      }
      this.macdDirection = 'up';
    } else if (currentMacd < this.lastMacdValue) {
      if (this.macdDirection === 'up') {
        // Direction changed from up to down - peak detected
        return true;
      }
      this.macdDirection = 'down';
    }

    this.lastMacdValue = currentMacd;
    return false;
  }

  private executeBuy(candle: CandleData, percentage: number) {
    const amount = (this.config.allowedCoinBalance * percentage) / 100;
    const coinAmount = amount / parseFloat(candle.close);
    
    this.trades.push({
      id: this.trades.length + 1,
      timestamp: new Date(candle.openTime),
      coinId: candle.coinId,
      usdPrice: amount,
      action: 'BUY',
      coinAmount,
      coinPrice: parseFloat(candle.close)
    });

    this.currentBalance -= amount;
    this.coinBalance += coinAmount;
    this.lastBuyPrice = parseFloat(candle.close);
    this.inLowWave = true;
  }

  private executeSell(candle: CandleData, isPartial: boolean = false) {
    const sellAmount = isPartial ? this.coinBalance * 0.5 : this.coinBalance;
    const usdValue = sellAmount * parseFloat(candle.close);
    const profitLoss = usdValue - (sellAmount * this.lastBuyPrice);

    this.trades.push({
      id: this.trades.length + 1,
      timestamp: new Date(candle.openTime),
      coinId: candle.coinId,
      usdPrice: usdValue,
      action: 'SELL',
      coinAmount: sellAmount,
      coinPrice: parseFloat(candle.close),
      profitLoss,
      partialFill: isPartial
    });

    this.currentBalance += usdValue;
    this.coinBalance -= sellAmount;
    
    if (!isPartial) {
      this.inLowWave = false;
      this.lastBuyPrice = 0;
    }
  }

  public simulate(data: CandleData[]): TradeHistory {
    const indicators = calculateIndicators(data, {
      rsiPeriod: this.config.rsiPeriod,
      macdFastPeriod: this.config.macdFastPeriod,
      macdSlowPeriod: this.config.macdSlowPeriod,
      macdSignalPeriod: this.config.macdSignalPeriod
    });

    for (let i = 0; i < data.length; i++) {
      const candle = data[i];
      const rsi = indicators.rsi[i];
      const macd = indicators.macd[i];
      
      if (rsi === null || macd === null) continue;

      // Update RSI wave
      this.rsiWave.push(rsi);
      if (this.rsiWave.length > 10) {
        this.rsiWave.shift();
      }

      // Check for MACD direction change
      const macdDirectionChanged = this.updateMacdDirection(macd);

      // Buy conditions
      if (rsi < this.config.rsiOversold && macdDirectionChanged && this.macdDirection === 'up') {
        this.executeBuy(candle, 30);
      } else if (this.inLowWave && rsi < this.config.rsiExtremeOversold && macd < 0) {
        if (rsi < 15) {
          this.executeBuy(candle, 40);
        } else if (rsi < 10) {
          this.executeBuy(candle, 30); // Remaining balance
        }
      }

      // Sell conditions
      if (rsi > this.config.rsiOverbought && macdDirectionChanged && this.macdDirection === 'down') {
        this.executeSell(candle);
      } else if (rsi > this.config.rsiExtremeOverbought && macd > 0) {
        this.executeSell(candle);
      }
    }

    // Calculate statistics
    const winCount = this.trades.filter(t => t.action === 'SELL' && (t.profitLoss || 0) > 0).length;
    const lossCount = this.trades.filter(t => t.action === 'SELL' && (t.profitLoss || 0) <= 0).length;
    const totalProfitLoss = this.trades
      .filter(t => t.action === 'SELL')
      .reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    return {
      trades: this.trades,
      currentBalance: this.currentBalance,
      totalProfitLoss,
      winCount,
      lossCount
    };
  }
} 