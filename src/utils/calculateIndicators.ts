/**
 * calculateIndicators.ts
 * This module contains functions for calculating various technical indicators
 * based on historical stock data.
 */

// Import statement
import { HistoricalDataPoint } from '../types';

/**
 * Interface representing the structure of calculated indicators.
 * @interface CalculatedIndicators
 */
export interface CalculatedIndicators {
    /** Array of Average True Range (ATR) values */
  atr: number[];
    /** Array of Relative Strength Index (RSI) values */
  rsi: number[];
    /** Moving Average Convergence Divergence (MACD) values */
  macd: {
    line: number[];
    signal: number[];
    histogram: number[];
  };
    /** Bollinger Bands values */
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
    /** Keltner Channels values */
  keltnerChannels: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
    /** Array of On-Balance Volume (OBV) values */
  obv: number[];
    /** Array of Accumulation/Distribution Line (ADL) values */
  adl: number[];
    /** Array of Chaikin Money Flow (CMF) values */
  cmf: number[];
    /** Anchored VWAP values */
  anchoredVWAP: {
    oneYear: number[];
    hundredDay: number[];
  };
}

/**
 * Calculates various technical indicators based on historical stock data.
 * @param {HistoricalDataPoint[]} historicalData - Array of historical stock data points
 * @returns {CalculatedIndicators} Object containing calculated indicator values
 */
export function calculateIndicators(historicalData: HistoricalDataPoint[]): CalculatedIndicators {
    // Calculate all required indicators
  const atr = calculateATR(historicalData, 14);
  const rsi = calculateRSI(historicalData, 14);
  const macd = calculateMACD(historicalData);
  const bollingerBands = calculateBollingerBands(historicalData, 20, 2);
  const keltnerChannels = calculateKeltnerChannels(historicalData, 20, 2);
  const obv = calculateOBV(historicalData);
  const adl = calculateADL(historicalData);
  const cmf = calculateCMF(historicalData, 20);

  const oneYearAgoIndex = Math.max(0, historicalData.length - 365);
  const hundredDaysAgoIndex = Math.max(0, historicalData.length - 100);
  const oneYearVWAP = calculateAnchoredVWAP(historicalData.slice(oneYearAgoIndex));
  const hundredDayVWAP = calculateAnchoredVWAP(historicalData.slice(hundredDaysAgoIndex));

  return {
    atr,
    rsi,
    macd,
    bollingerBands,
    keltnerChannels,
    obv,
    adl,
    cmf,
    anchoredVWAP: {
      oneYear: oneYearVWAP,
      hundredDay: hundredDayVWAP,
    },
  };
}

/**
 * Calculates the Average True Range (ATR) indicator.
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @param {number} period - The period over which to calculate ATR
 * @returns {number[]} Array of ATR values
 */
function calculateATR(data: HistoricalDataPoint[], period: number): number[] {
    const trueRanges: number[] = []; // Array to store True Range values
    const atr: number[] = []; // Array to store ATR values
  
    // Calculate True Ranges
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        trueRanges.push(data[i].high - data[i].low);
      } else {
        const highLow = data[i].high - data[i].low;
        const highClosePrev = Math.abs(data[i].high - data[i - 1].close);
        const lowClosePrev = Math.abs(data[i].low - data[i - 1].close);
        trueRanges.push(Math.max(highLow, highClosePrev, lowClosePrev));
      }
    }
  
    // Calculate ATR
    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        atr.push(trueRanges.slice(0, i + 1).reduce((sum, value) => sum + value, 0) / (i + 1));
      } else {
        atr.push((atr[i - 1] * (period - 1) + trueRanges[i]) / period);
      }
    }
  
    return atr;
  }

  /**
 * Calculates the Moving Average Convergence Divergence (MACD) indicator.
 * @param {HistoricalDataPoint[]} historicalData - Array of historical stock data points
 * @returns {{ line: number[], signal: number[], histogram: number[] }} MACD values
 */
// function calculateMACD(historicalData: HistoricalDataPoint[]): { line: number[], signal: number[], histogram: number[] } {
//   // Implementation goes here
//   // This is a placeholder for future implementation
//   return { line: [], signal: [], histogram: [] };
// }

/**
 * Calculates the Relative Strength Index (RSI) indicator.
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @param {number} period - The period over which to calculate RSI
 * @returns {number[]} Array of RSI values
 */
function calculateRSI(data: HistoricalDataPoint[], period: number): number[] {
  const rsi: number[] = [];
  let gains: number[] = [];
  let losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(Math.max(change, 0));
    losses.push(Math.max(-change, 0));
  }

  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

  // Calculate RSI
  for (let i = period; i < data.length; i++) {
    if (i > period) {
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    }
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
}

/**
 * Calculates the Moving Average Convergence Divergence (MACD) indicator.
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @returns {{ line: number[], signal: number[], histogram: number[] }} MACD values
 */
function calculateMACD(data: HistoricalDataPoint[]): { line: number[], signal: number[], histogram: number[] } {
  const closePrices = data.map(d => d.close);
  const ema12 = calculateEMA(closePrices, 12);
  const ema26 = calculateEMA(closePrices, 26);
  const macdLine = ema12.map((value, index) => value - ema26[index]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((value, index) => value - signalLine[index]);

  return { line: macdLine, signal: signalLine, histogram };
}

/**
 * Calculates the Exponential Moving Average (EMA).
 * @param {number[]} data - Array of price values
 * @param {number} period - The period over which to calculate EMA
 * @returns {number[]} Array of EMA values
 */
function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Initialize EMA with SMA
  let sma = data.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  ema.push(sma);

  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }

  return ema;
}

/**
 * Calculates Bollinger Bands.
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @param {number} period - The period over which to calculate Bollinger Bands
 * @param {number} stdDev - Number of standard deviations for the bands
 * @returns {{ upper: number[], middle: number[], lower: number[] }} Bollinger Bands values
 */
function calculateBollingerBands(data: HistoricalDataPoint[], period: number, stdDev: number): { upper: number[], middle: number[], lower: number[] } {
  const closePrices = data.map(d => d.close);
  const sma = calculateSMA(closePrices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = period - 1; i < closePrices.length; i++) {
    const slice = closePrices.slice(i - period + 1, i + 1);
    const std = calculateStandardDeviation(slice);
    upper.push(sma[i - period + 1] + stdDev * std);
    lower.push(sma[i - period + 1] - stdDev * std);
  }

  return { upper, middle: sma, lower };
}

/**
 * Calculates the Simple Moving Average (SMA).
 * @param {number[]} data - Array of price values
 * @param {number} period - The period over which to calculate SMA
 * @returns {number[]} Array of SMA values
 */
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

/**
 * Calculates the Standard Deviation of a dataset.
 * @param {number[]} data - Array of numbers
 * @returns {number} Standard Deviation value
 */
function calculateStandardDeviation(data: number[]): number {
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const squareDiffs = data.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / data.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculates Keltner Channels.
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @param {number} period - The period over which to calculate Keltner Channels
 * @param {number} multiplier - Multiplier for the ATR
 * @returns {{ upper: number[], middle: number[], lower: number[] }} Keltner Channels values
 */
function calculateKeltnerChannels(data: HistoricalDataPoint[], period: number, multiplier: number): { upper: number[], middle: number[], lower: number[] } {
  const closePrices = data.map(d => d.close);
  const ema = calculateEMA(closePrices, period);
  const atr = calculateATR(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < ema.length; i++) {
    upper.push(ema[i] + multiplier * atr[i]);
    lower.push(ema[i] - multiplier * atr[i]);
  }

  return { upper, middle: ema, lower };
}

/**
 * Calculates On-Balance Volume (OBV).
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @returns {number[]} Array of OBV values
 */
function calculateOBV(data: HistoricalDataPoint[]): number[] {
  const obv: number[] = [0];
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      obv.push(obv[i - 1] + data[i].volume);
    } else if (data[i].close < data[i - 1].close) {
      obv.push(obv[i - 1] - data[i].volume);
    } else {
      obv.push(obv[i - 1]);
    }
  }
  return obv;
}

/**
 * Calculates Chaikin Money Flow (CMF).
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @param {number} period - The period over which to calculate CMF
 * @returns {number[]} Array of CMF values
 */
function calculateCMF(data: HistoricalDataPoint[], period: number): number[] {
    const cmf: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      let mfvSum = 0;
      let volumeSum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const mfm = ((data[j].close - data[j].low) - (data[j].high - data[j].close)) / (data[j].high - data[j].low);
        mfvSum += mfm * data[j].volume;
        volumeSum += data[j].volume;
      }
      cmf.push(mfvSum / volumeSum);
    }
    return cmf;
  }
  
/**
 * Calculates Accumulation/Distribution Line (ADL).
 * @param {HistoricalDataPoint[]} data - Array of historical stock data points
 * @returns {number[]} Array of ADL values
 */
function calculateADL(data: HistoricalDataPoint[]): number[] {
    const adl: number[] = [0];
    for (let i = 1; i < data.length; i++) {
      const mfm = ((data[i].close - data[i].low) - (data[i].high - data[i].close)) / (data[i].high - data[i].low);
      const mfv = mfm * data[i].volume;
      adl.push(adl[i - 1] + mfv);
    }
    return adl;
  }
  
  /**
   * Calculates Anchored VWAP (Volume Weighted Average Price).
   * @param {HistoricalDataPoint[]} data - Array of historical stock data points
   * @returns {number[]} Array of VWAP values
   */
  function calculateAnchoredVWAP(data: HistoricalDataPoint[]): number[] {
    let cumulativeTPV = 0; // Total Price * Volume
    let cumulativeVolume = 0;
    
    return data.map((d) => {
      const typicalPrice = (d.high + d.low + d.close) / 3;
      cumulativeTPV += typicalPrice * d.volume;
      cumulativeVolume += d.volume;
      return cumulativeTPV / cumulativeVolume;
    });
  }