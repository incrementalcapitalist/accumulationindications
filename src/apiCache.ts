/**
 * apiCache.ts
 * This module implements a caching mechanism for API responses to improve
 * application performance and reduce unnecessary API calls.
 */

import { StockData, HistoricalDataPoint } from './types';

/**
 * Interface for the cache entry structure
 */
interface CacheEntry {
  stockData: StockData;
  historicalData: HistoricalDataPoint[];
  timestamp: number;
}

/**
 * Class representing an API response cache
 */
class ApiCache {
  private cache: Map<string, CacheEntry>;
  private readonly cacheDuration: number;

  /**
   * Create an ApiCache instance
   * @param {number} cacheDuration - Duration in milliseconds for which cache entries are considered valid
   */
  constructor(cacheDuration: number = 5 * 60 * 1000) { // Default to 5 minutes
    this.cache = new Map();
    this.cacheDuration = cacheDuration;
  }

  /**
   * Set a cache entry for a given symbol
   * @param {string} symbol - The stock symbol
   * @param {StockData} stockData - The current stock data
   * @param {HistoricalDataPoint[]} historicalData - The historical stock data
   */
  set(symbol: string, stockData: StockData, historicalData: HistoricalDataPoint[]): void {
    this.cache.set(symbol, {
      stockData,
      historicalData,
      timestamp: Date.now()
    });
  }

  /**
   * Get a cache entry for a given symbol if it exists and is still valid
   * @param {string} symbol - The stock symbol
   * @returns {CacheEntry | null} The cache entry if valid, null otherwise
   */
  get(symbol: string): CacheEntry | null {
    const entry = this.cache.get(symbol);
    if (entry && Date.now() - entry.timestamp < this.cacheDuration) {
      return entry;
    }
    return null;
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance of ApiCache
export const apiCache = new ApiCache();