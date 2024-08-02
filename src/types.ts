/**
 * types.ts
 * This file contains type definitions used throughout the application.
 */

/**
 * Represents the data for a single stock quote.
 */
export interface StockData {
    /** The stock's ticker symbol (e.g., "AAPL" for Apple Inc.) */
    symbol: string;
    /** The current price of the stock */
    price: number;
    /** The opening price of the stock for the current trading day */
    open: number;
    /** The highest price the stock reached during the current trading day */
    high: number;
    /** The lowest price the stock reached during the current trading day */
    low: number;
    /** The number of shares traded during the current trading day */
    volume: number;
    /** The date of the most recent trading day, formatted as "YYYY-MM-DD" */
    latestTradingDay: string;
    /** The closing price of the stock from the previous trading day */
    previousClose: number;
    /** The absolute change in price from the previous close */
    change: number;
    /** The percentage change in price from the previous close, formatted as a string with a '%' symbol */
    changePercent: string;
  }
  
  /**
   * Represents a single data point in the historical price data.
   */
  export interface HistoricalDataPoint {
    /** The date of this data point, formatted as "YYYY-MM-DD" */
    time: string;
    /** The opening price on this date */
    open: number;
    /** The highest price reached on this date */
    high: number;
    /** The lowest price reached on this date */
    low: number;
    /** The closing price on this date */
    close: number;
    /** The number of shares traded on this date */
    volume: number;
  }
  
  /**
   * Defines the possible types of tabs in the application.
   */
  export type TabType = 'quote' | 'accumulation' | 'obv' | 'rsi' | 'macd' | 'atr' | 'cmf' | 'fibonacci' | 'heikin-ashi' | 'darvas' | 'volatility';