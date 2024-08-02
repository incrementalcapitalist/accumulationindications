/**
 * useStockData.ts
 * This custom hook manages the fetching and state management of stock data.
 */

import { useState, useCallback, useEffect } from 'react';
import { StockData, HistoricalDataPoint } from '../types';
import { apiCache } from '../apiCache';
import { fetchStockData } from '../api/stockApi';

/**
 * Custom hook for managing stock data
 * 
 * @param {string} symbol - The stock symbol to fetch data for
 * @returns {Object} An object containing stock data, loading state, error state, and a fetch function
 */
export const useStockData = (symbol: string) => {
  // State for current stock data
  const [stockData, setStockData] = useState<StockData | null>(null);
  
  // State for historical stock data
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  
  // State for loading indicator
  const [loading, setLoading] = useState<boolean>(false);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches stock data from the API or cache
   */
  const fetchData = useCallback(async () => {
    // Validate input
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    // Set loading state and clear any previous errors
    setLoading(true);
    setError(null);

    try {
      // Attempt to fetch data from the API
      const { stockData: newStockData, historicalData: newHistoricalData } = await fetchStockData(symbol);
      
      // Update state with new data
      setStockData(newStockData);
      setHistoricalData(newHistoricalData);
      
      // Update the cache with new data
      apiCache.set(symbol, newStockData, newHistoricalData);
    } catch (err) {
      // Handle any errors during data fetching
      setError('Failed to fetch data. Please try again later.');
      console.error("Error fetching data:", err);
    } finally {
      // Set loading state to false when the operation is complete
      setLoading(false);
    }
  }, [symbol]); // This effect depends on the symbol

  /**
   * Effect to clear data when symbol changes
   */
  useEffect(() => {
    // Clear existing data when symbol changes
    setStockData(null);
    setHistoricalData([]);
    setError(null);
  }, [symbol]);

  // Return the state and fetchData function
  return { stockData, historicalData, loading, error, fetchData };
};