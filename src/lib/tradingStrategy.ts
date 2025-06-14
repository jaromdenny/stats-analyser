import { Trade, StrategyConfig, TradeHistory, WavePoint } from '@/types/trading';
import { CandleData } from '@/types/crypto';
import { calculateIndicators } from './indicators';

export class TradingStrategy {
  private config: StrategyConfig;
  private trades: Trade[] = [];
  private coinBalance: number = 0; // Number of coins held
  private usdBalance: number; // USD balance available for trading
  private lastBuyPrice: number = 0;
  private inLowWave: boolean = false;
  private lastMacdValue: number | null = null;
  private macdDirection: 'up' | 'down' | null = null;
  private rsiWave: number[] = [];
  
  // New state variables for improved buy logic
  private rsiWentOversold: boolean = false;
  private macdWentDownAfterOversold: boolean = false;
  private rsiWentOverbought: boolean = false;
  private macdWentUpAfterOverbought: boolean = false;

  constructor(config: StrategyConfig) {
    this.config = config;
    this.usdBalance = config.allowedCoinBalance; // Start with full USD balance
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
      this.macdDirection = 'up'; // Initialize with 'up' if MACD is positive, 'down' if negative
      return false;
    }

    const directionChanged = 
      (currentMacd > this.lastMacdValue && this.macdDirection === 'down') ||
      (currentMacd < this.lastMacdValue && this.macdDirection === 'up');

    if (currentMacd > this.lastMacdValue) {
      this.macdDirection = 'up';
    } else if (currentMacd < this.lastMacdValue) {
      this.macdDirection = 'down';
    }

    this.lastMacdValue = currentMacd;
    return directionChanged;
  }

  private executeBuy(candle: CandleData, percentage: number) {
    const currentPrice = parseFloat(candle.close);
    const usdAmount = (this.usdBalance * percentage) / 100;
    const coinAmount = usdAmount / currentPrice;
    
    this.trades.push({
      id: this.trades.length + 1,
      timestamp: new Date(candle.openTime),
      coinId: candle.coinId,
      usdPrice: usdAmount,
      action: 'BUY',
      coinAmount,
      coinPrice: currentPrice
    });

    console.log('Buy executed:', {
      currentPrice,
      usdAmount,
      coinAmount,
      usdBalance: this.usdBalance,
      coinBalance: this.coinBalance
    });

    this.usdBalance -= usdAmount;
    this.coinBalance += coinAmount;
    this.lastBuyPrice = currentPrice;
    this.inLowWave = true;
  }

  private executeSell(candle: CandleData, percentage: number = 100) {
    const currentPrice = parseFloat(candle.close);
    const sellAmount = (this.coinBalance * percentage) / 100;
    const usdValue = sellAmount * currentPrice;
    const profitLoss = usdValue - (sellAmount * this.lastBuyPrice);

    this.trades.push({
      id: this.trades.length + 1,
      timestamp: new Date(candle.openTime),
      coinId: candle.coinId,
      usdPrice: usdValue,
      action: 'SELL',
      coinAmount: sellAmount,
      coinPrice: currentPrice,
      profitLoss,
      partialFill: percentage < 100
    });

    console.log('Sell executed:', {
      usdValue,
      sellAmount,
      percentage,
      usdBalance: this.usdBalance,
      coinBalance: this.coinBalance
    });

    this.usdBalance += usdValue;
    this.coinBalance -= sellAmount;
    
    if (percentage >= 100) {
      this.inLowWave = false;
      this.lastBuyPrice = 0;
    }
  }

  public simulate(data: CandleData[]): TradeHistory {
    const indicators = calculateIndicators(data, this.config);

    for (let i = 0; i < data.length; i++) {
      const candle = data[i];
      const rsi = indicators.rsi[i];
      const macd = indicators.macd.MACD[i];
      

      if (rsi === null || macd === null) continue;

      // Update RSI wave
      this.rsiWave.push(rsi);
      if (this.rsiWave.length > 10) {
        this.rsiWave.shift();
      }

      // Check for MACD direction change
      const macdDirectionChanged = this.updateMacdDirection(macd);

      // Track RSI oversold state
      if (rsi < this.config.rsiOversold) {
        this.rsiWentOversold = true;
        console.log('RSI went oversold:', { rsi, rsiOversold: this.config.rsiOversold });
      } else if (rsi > this.config.rsiOversold + 5) {
        // Reset oversold state when RSI moves well above oversold threshold
        this.rsiWentOversold = false;
        this.macdWentDownAfterOversold = false;
      }

      // Track RSI overbought state
      if (rsi > this.config.rsiOverbought) {
        this.rsiWentOverbought = true;
        console.log('RSI went overbought:', { rsi, rsiOverbought: this.config.rsiOverbought });
      } else if (rsi < this.config.rsiOverbought - 5) {
        // Reset overbought state when RSI moves well below overbought threshold
        this.rsiWentOverbought = false;
        this.macdWentUpAfterOverbought = false;
      }

      // Track MACD trends after RSI conditions
      if (this.rsiWentOversold && this.macdDirection === 'down') {
        this.macdWentDownAfterOversold = true;
        console.log('MACD went down after RSI oversold:', { macd, macdDirection: this.macdDirection });
      }

      if (this.rsiWentOverbought && this.macdDirection === 'up') {
        this.macdWentUpAfterOverbought = true;
        console.log('MACD went up after RSI overbought:', { macd, macdDirection: this.macdDirection });
      }

      if (this.coinBalance > 0){
        console.log('Candle', i, {
        rsi,
        macd,
        coinBalance: this.coinBalance,
        usdBalance: this.usdBalance,
        macdDirection: this.macdDirection,
        inLowWave: this.inLowWave,
        rsiWentOversold: this.rsiWentOversold,
        macdWentDownAfterOversold: this.macdWentDownAfterOversold,
        rsiWentOverbought: this.rsiWentOverbought,
        macdWentUpAfterOverbought: this.macdWentUpAfterOverbought,
        config: {
          rsiOversold: this.config.rsiOversold,
          rsiOverbought: this.config.rsiOverbought,
          rsiExtremeOversold: this.config.rsiExtremeOversold,
          rsiExtremeOverbought: this.config.rsiExtremeOverbought
        }
      });
      console.log('MACD direction changed:', macdDirectionChanged);
    }
      

      // Buy conditions - only buy if we have USD balance
      if (this.usdBalance > 0) {
        // New buy logic: RSI went oversold, then MACD went down, now MACD changed to up
        if (this.rsiWentOversold && this.macdWentDownAfterOversold && macdDirectionChanged && this.macdDirection === 'up') {
          console.log('Buy condition 1 met (new logic):', { 
            rsi, 
            macd, 
            macdDirection: this.macdDirection,
            rsiWentOversold: this.rsiWentOversold,
            macdWentDownAfterOversold: this.macdWentDownAfterOversold,
            usdBalance: this.usdBalance
          });
          this.executeBuy(candle, this.config.oversoldBuyPercentage);
          
          // Reset buy conditions after executing
          this.rsiWentOversold = false;
          this.macdWentDownAfterOversold = false;
        } else if (this.inLowWave && rsi < this.config.rsiExtremeOversold && macd < 0) {
          console.log('Buy condition 2 met (extreme oversold):', { 
            rsi, 
            macd, 
            inLowWave: this.inLowWave,
            rsiExtremeOversold: this.config.rsiExtremeOversold,
            usdBalance: this.usdBalance
          });
          if (rsi < this.config.rsiExtremeOversold) {
            this.executeBuy(candle, this.config.extremeOversoldBuyPercentage);
          } else if (rsi < this.config.rsiExtremeOversold - 5) {
            this.executeBuy(candle, this.config.extremeOversoldBuyPercentage * 0.75); // 75% of extreme oversold percentage
          }
        }
      }

      // Sell conditions - only sell if we have coins
      if (this.coinBalance > 0) {
        // New sell logic: RSI went overbought, then MACD went up, now MACD changed to down
        if (this.rsiWentOverbought && this.macdWentUpAfterOverbought && macdDirectionChanged && this.macdDirection === 'down') {
          console.log('Sell condition 1 met (new logic):', { 
            rsi, 
            macd, 
            macdDirection: this.macdDirection,
            rsiWentOverbought: this.rsiWentOverbought,
            macdWentUpAfterOverbought: this.macdWentUpAfterOverbought,
            coinBalance: this.coinBalance
          });
          this.executeSell(candle, this.config.overboughtSellPercentage);
          
          // Reset sell conditions after executing
          this.rsiWentOverbought = false;
          this.macdWentUpAfterOverbought = false;
        } else if (rsi > this.config.rsiExtremeOverbought && macd > 0) {
          console.log('Sell condition 2 met (extreme overbought):', { 
            rsi, 
            macd,
            rsiExtremeOverbought: this.config.rsiExtremeOverbought,
            coinBalance: this.coinBalance
          });
          this.executeSell(candle, this.config.extremeOverboughtSellPercentage);
        }
      }
    }

    // Calculate statistics
    const winCount = this.trades.filter(t => t.action === 'SELL' && (t.profitLoss || 0) > 0).length;
    const lossCount = this.trades.filter(t => t.action === 'SELL' && (t.profitLoss || 0) <= 0).length;
    const totalProfitLoss = this.trades
      .filter(t => t.action === 'SELL')
      .reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    console.log('Final results:', {
      totalTrades: this.trades.length,
      winCount,
      lossCount,
      totalProfitLoss,
      finalCoinBalance: this.coinBalance,
      finalUsdBalance: this.usdBalance
    });

    return {
      trades: this.trades,
      currentBalance: this.coinBalance,
      totalProfitLoss,
      winCount,
      lossCount
    };
  }
} 