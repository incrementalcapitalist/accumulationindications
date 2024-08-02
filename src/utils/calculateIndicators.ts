/**
 * calculateIndicators.ts
 * This module contains functions for calculating various technical indicators
 * based on historical stock data.
 */

// Import statement
import { HistoricalDataPoint } from '../types';

/**
 * Interface representing the structure of calculated indicators
 */
export interface CalculatedIndicators {
  rsi: number[];
  macd: { macd: number; signal: number; histogram: number }[];
  bollingerBands: { upper: number; middle: number; lower: number }[];
  keltnerChannels: { upper: number; middle: number; lower: number }[];
  obv: number[];
  atr: number[];
  cmf: number[];
  adl: number[];
}

/**
 * Calculates all technical indicators based on the provided historical data
 * @param {HistoricalDataPoint[]} data - Array of historical price data points
 * @returns {CalculatedIndicators} Object containing all calculated indicators
 */
export function calculateIndicators(historicalData: HistoricalDataPoint[]): CalculatedIndicators {
  // Implement your indicator calculations here
  const atr = calculateATR(historicalData, 14); // Example: 14-period ATR

  return {
    atr,
    rsi: calculateRSI(data),
    macd: calculateMACD(data),
    bollingerBands: calculateBollingerBands(data),
    keltnerChannels: calculateKeltnerChannels(data),
    obv: calculateOBV(data),
    cmf: calculateCMF(data),
    adl: calculateADL(data),
  };
}

function calculateATR(data: HistoricalDataPoint[], period: number): number[] {
  // Implement ATR calculation here
  // This is a placeholder implementation
  return data.map((_, i) => {
    if (i < period - 1) return 0;
    // Actual ATR calculation would go here
    return Math.random() * 10; // Placeholder: replace with actual calculation
  });
}

/**
 * Calculates the Relative Strength Index (RSI)
 * @param {HistoricalDataPoint[]} data - Array of historical price data points
 * @param {number} period - The period for RSI calculation (default: 14)
 * @returns {number[]} Array of RSI values
 */
function calculateRSI(data: HistoricalDataPoint[], period: number = 14): number[] {
    const changes = data.slice(1).map((d, i) => d.close - data[i].close);
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);
  
    const avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
  
    const rsi = [100 - (100 / (1 + avgGain / avgLoss))];
  
    for (let i = period; i < data.length - 1; i++) {
      const gain = gains[i];
      const loss = losses[i];
      const newAvgGain = (avgGain * (period - 1) + gain) / period;
      const newAvgLoss = (avgLoss * (period - 1) + loss) / period;
      rsi.push(100 - (100 / (1 + newAvgGain / newAvgLoss)));
    }
  
    return rsi;
  }
  
  /**
   * Calculates the Moving Average Convergence Divergence (MACD)
   * @param {HistoricalDataPoint[]} data - Array of historical price data points
   * @param {number} fastPeriod - The fast EMA period (default: 12)
   * @param {number} slowPeriod - The slow EMA period (default: 26)
   * @param {number} signalPeriod - The signal line period (default: 9)
   * @returns {{ macd: number; signal: number; histogram: number }[]} Array of MACD values
   */
  function calculateMACD(data: HistoricalDataPoint[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number; signal: number; histogram: number }[] {
    const closePrices = data.map(d => d.close);
    const fastEMA = calculateEMA(closePrices, fastPeriod);
    const slowEMA = calculateEMA(closePrices, slowPeriod);
  
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signalLine = calculateEMA(macdLine, signalPeriod);
  
    return macdLine.map((macd, i) => ({
      macd,
      signal: signalLine[i],
      histogram: macd - signalLine[i]
    }));
  }
  
  /**
   * Calculates Bollinger Bands
   * @param {HistoricalDataPoint[]} data - Array of historical price data points
   * @param {number} period - The period for SMA calculation (default: 20)
   * @param {number} stdDevMultiplier - The standard deviation multiplier (default: 2)
   * @returns {{ upper: number; middle: number; lower: number }[]} Array of Bollinger Bands values
   */
  function calculateBollingerBands(data: HistoricalDataPoint[], period: number = 20, stdDevMultiplier: number = 2): { upper: number; middle: number; lower: number }[] {
    const closePrices = data.map(d => d.close);
    const sma = calculateSMA(closePrices, period);
  
    return sma.map((middle, i) => {
      const slice = closePrices.slice(i - period + 1, i + 1);
      const stdDev = calculateStandardDeviation(slice);
      const deviation = stdDev * stdDevMultiplier;
      return {
        upper: middle + deviation,
        middle,
        lower: middle - deviation
      };
    });
  }
  
  /**
   * Calculates Keltner Channels
   * @param {HistoricalDataPoint[]} data - Array of historical price data points
   * @param {number} emaPeriod - The period for EMA calculation (default: 20)
   * @param {number} atrPeriod - The period for ATR calculation (default: 10)
   * @param {number} multiplier - The ATR multiplier (default: 2)
   * @returns {{ upper: number; middle: number; lower: number }[]} Array of Keltner Channels values
   */
  function calculateKeltnerChannels(data: HistoricalDataPoint[], emaPeriod: number = 20, atrPeriod: number = 10, multiplier: number = 2): { upper: number; middle: number; lower: number }[] {
    const closePrices = data.map(d => d.close);
    const ema = calculateEMA(closePrices, emaPeriod);
    const atr = calculateATR(data, atrPeriod);
  
    return ema.map((middle, i) => ({
      upper: middle + multiplier * atr[i],
      middle,
      lower: middle - multiplier * atr[i]
    }));
  }
  
  /**
   * Calculates On-Balance Volume (OBV)
   * @param {HistoricalDataPoint[]} data - Array of historical price data points
   * @returns {number[]} Array of OBV values
   */
  function calculateOBV(data: HistoricalDataPoint[]): number[] {
    let obv = 0;
    return data.map((d, i) => {
      if (i === 0) return obv;
      if (d.close > data[i - 1].close) obv += d.volume;
      else if (d.close < data[i - 1].close) obv -= d.volume;
      return obv;
    });
  }
  
  /**
   * Calculates Average True Range (ATR)
   * @param {HistoricalDataPoint[]} data - Array of historical price data points
   * @param {number} period - The period for ATR calculation (default: 14)
   * @returns {number[]} Array of ATR values
   */
  function calculateATR(data: HistoricalDataPoint[], period: number = 14): number[] {
    const trueRanges = data.map((d, i) => {
      if (i === 0) return d.high - d.low;
      const prevClose = data[i - 1].close;
      return Math.max(d.high - d.low, Math.abs(d.high - prevClose), Math.abs(d.low - prevClose));
    });
  
    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    const atrs = [atr];
  
    for (let i = period; i < data.length; i++) {
      atr = ((atr * (period - 1)) + trueRanges[i]) / period;
      atrs.push(atr);
    }
  
    return atrs;
  }
  
  /**
   * Calculates Chaikin Money Flow (CMF)
   * @param {HistoricalDataPoint[]} data - Array of historical price data points
   * @param {number} period - The period for CMF calculation (default: 20)
   * @returns {number[]} Array of CMF values
   */
  function calculateCMF(data: HistoricalDataPoint[], period: number = 20): number[] {
    const mfv = data.map(d => {
      const moneyFlowMultiplier = ((d.close - d.low) - (d.high - d.close)) / (d.high - d.low);
      return moneyFlowMultiplier * d.volume;
    });
  
    const cmf = [];
    for (let i = period - 1; i < data.length; i++) {
      const periodMFV = mfv.slice(i - period + 1, i + 1);
      const periodVolume = data.slice(i - period + 1, i + 1).map(d => d.volume);
      cmf.push(periodMFV.reduce((sum, v) => sum + v, 0) / periodVolume.reduce((sum, v) => sum + v, 0));
    }
  
    return cmf;
  }
  
  /**
   * Calculates Accumulation/Distribution Line (ADL)
   * @param {HistoricalDataPoint[]} data - Array of historical price data points
   * @returns {number[]} Array of ADL values
   */
  function calculateADL(data: HistoricalDataPoint[]): number[] {
    let adl = 0;
    return data.map(d => {
      const mfm = ((d.close - d.low) - (d.high - d.close)) / (d.high - d.low);
      const mfv = mfm * d.volume;
      adl += mfv;
      return adl;
    });
  }
  
  /**
   * Calculates Exponential Moving Average (EMA)
   * @param {number[]} data - Array of price values
   * @param {number} period - The period for EMA calculation
   * @returns {number[]} Array of EMA values
   */
  function calculateEMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    let ema = data[0];
    return data.map((price, i) => {
      if (i === 0) return ema;
      ema = price * k + ema * (1 - k);
      return ema;
    });
  }
  
  /**
   * Calculates Simple Moving Average (SMA)
   * @param {number[]} data - Array of price values
   * @param {number} period - The period for SMA calculation
   * @returns {number[]} Array of SMA values
   */
  function calculateSMA(data: number[], period: number): number[] {
    return data.map((d, i) => {
      if (i < period - 1) return NaN;
      return data.slice(i - period + 1, i + 1).reduce((sum, price) => sum + price, 0) / period;
    }).filter(d => !isNaN(d));
  }
  
  /**
   * Calculates Standard Deviation
   * @param {number[]} data - Array of values
   * @returns {number} The standard deviation of the input values
   */
  function calculateStandardDeviation(data: number[]): number {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const squareDiffs = data.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / data.length;
    return Math.sqrt(avgSquareDiff);
  }