/**
 * stockApi.ts
 * This module contains functions for fetching stock data from external APIs.
 */

import { StockData, HistoricalDataPoint } from '../types';
import { format, subYears } from 'date-fns';

/**
 * Fetches current and historical stock data for a given symbol
 * 
 * @param {string} symbol - The stock symbol to fetch data for
 * @returns {Promise<{ stockData: StockData; historicalData: HistoricalDataPoint[] }>} A promise that resolves to an object containing current stock data and historical data
 */
export const fetchStockData = async (symbol: string): Promise<{ stockData: StockData; historicalData: HistoricalDataPoint[] }> => {
  try {
    // Fetch current stock data from Polygon.io
    const quoteResponse = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`);
    const quoteData = await quoteResponse.json();

    // Check if the API returned an error
    if (quoteData.status === 'ERROR') {
      throw new Error(quoteData.message || 'Failed to fetch data from Polygon.io');
    }

    // Extract the relevant data from the API response
    const result = quoteData.results[0];
    
    // Create a new StockData object
    const stockData: StockData = {
      symbol: symbol,
      price: result?.c ?? 0,
      open: result?.o ?? 0,
      high: result?.h ?? 0,
      low: result?.l ?? 0,
      volume: result?.v ?? 0,
      latestTradingDay: result?.t ? format(new Date(result.t), 'yyyy-MM-dd') : 'N/A',
      previousClose: result?.pc ?? 0,
      change: Number((result?.c - result?.pc).toFixed(2)),
      changePercent: ((result?.c - result?.pc) / result?.pc * 100).toFixed(2) + '%'
    };

    // Calculate date range for historical data (1 year)
    const toDate = new Date();
    const fromDate = subYears(toDate, 1);

    // Fetch historical data from Polygon.io
    const historicalResponse = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${format(fromDate, 'yyyy-MM-dd')}/${format(toDate, 'yyyy-MM-dd')}?apiKey=${import.meta.env.VITE_POLYGON_API_KEY}&sort=asc&limit=365`);
    const historicalData = await historicalResponse.json();

    // Check if the API returned an error
    if (historicalData.status === 'ERROR') {
      throw new Error(historicalData.message || 'Failed to fetch historical data from Polygon.io');
    }

    // Format the historical data to match our HistoricalDataPoint interface
    const formattedHistoricalData: HistoricalDataPoint[] = historicalData.results.map((item: any) => ({
      time: format(new Date(item.t), 'yyyy-MM-dd'),
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
    }));

    // Return both current stock data and historical data
    return { stockData, historicalData: formattedHistoricalData };
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('Error fetching stock data:', error);
    // Re-throw the error to be handled by the calling function
    throw error;
  }
};