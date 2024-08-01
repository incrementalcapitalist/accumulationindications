/**
 * types.ts
 * This file contains type definitions for the stock data used throughout the application.
 */

/**
 * Represents the data for a single stock quote.
 * 
 * @interface StockData
 * @property {string} symbol - The stock's ticker symbol (e.g., "AAPL" for Apple Inc.).
 * @property {number} price - The current price of the stock.
 * @property {number} open - The opening price of the stock for the current trading day.
 * @property {number} high - The highest price the stock reached during the current trading day.
 * @property {number} low - The lowest price the stock reached during the current trading day.
 * @property {number} volume - The number of shares traded during the current trading day.
 * @property {string} latestTradingDay - The date of the most recent trading day, formatted as "YYYY-MM-DD".
 * @property {number} previousClose - The closing price of the stock from the previous trading day.
 * @property {number} change - The absolute change in price from the previous close.
 * @property {string} changePercent - The percentage change in price from the previous close, formatted as a string with a '%' symbol.
 */
export interface StockData {
    symbol: string;
    price: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    latestTradingDay: string;
    previousClose: number;
    change: number;
    changePercent: string;
  }
  
  /**
   * Represents a single data point in the historical price data.
   * 
   * @interface HistoricalDataPoint
   * @property {string} time - The date of this data point, formatted as "YYYY-MM-DD".
   * @property {number} open - The opening price on this date.
   * @property {number} high - The highest price reached on this date.
   * @property {number} low - The lowest price reached on this date.
   * @property {number} close - The closing price on this date.
   * @property {number} volume - The number of shares traded on this date.
   */
  export interface HistoricalDataPoint {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  /**
   * Represents the response structure from the Alpha Vantage API for daily time series data.
   * 
   * @interface AlphaVantageDaily
   * @property {Object} [Time Series (Daily)] - An object where keys are dates and values are daily price data.
   */
  export interface AlphaVantageDaily {
    'Time Series (Daily)'?: {
      [date: string]: {
        '1. open': string;
        '2. high': string;
        '3. low': string;
        '4. close': string;
        '5. volume': string;
      };
    };
  }
  
  /**
   * Represents the response structure from the Polygon.io API for aggregated data.
   * 
   * @interface PolygonAggregates
   * @property {string} ticker - The stock symbol.
   * @property {number} queryCount - The number of aggregates returned.
   * @property {number} resultsCount - The total number of results for this ticker.
   * @property {boolean} adjusted - Whether the results are adjusted for splits.
   * @property {PolygonResult[]} results - The array of aggregate results.
   * @property {string} status - The status of the request.
   * @property {string} request_id - The unique identifier for this request.
   * @property {number} count - The count of aggregates returned.
   */
  export interface PolygonAggregates {
    ticker: string;
    queryCount: number;
    resultsCount: number;
    adjusted: boolean;
    results: PolygonResult[];
    status: string;
    request_id: string;
    count: number;
  }
  
  /**
   * Represents a single result in the Polygon.io API response.
   * 
   * @interface PolygonResult
   * @property {number} v - The trading volume.
   * @property {number} o - The open price.
   * @property {number} c - The close price.
   * @property {number} h - The highest price.
   * @property {number} l - The lowest price.
   * @property {number} t - The Unix Msec timestamp for the start of the aggregate window.
   * @property {number} n - The number of transactions in the aggregate window.
   */
  export interface PolygonResult {
    v: number;  // volume
    o: number;  // open price
    c: number;  // close price
    h: number;  // high price
    l: number;  // low price
    t: number;  // Unix Msec timestamp
    n: number;  // number of transactions
  }