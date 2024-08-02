/**
 * useCSVDownload.ts
 * This custom hook provides functionality to download stock data as CSV files.
 */

import { useCallback } from 'react';
import { StockData, HistoricalDataPoint } from '../types';

/**
 * Custom hook for downloading stock data as CSV
 * 
 * @param {StockData | null} stockData - Current stock data
 * @param {HistoricalDataPoint[]} historicalData - Historical stock data
 * @returns {Object} An object containing functions to download CSV data
 */
export const useCSVDownload = (stockData: StockData | null, historicalData: HistoricalDataPoint[]) => {
  /**
   * Downloads historical stock data as a CSV file
   */
  const downloadCSV = useCallback(() => {
    // Check if historical data is available
    if (historicalData.length === 0) {
      console.error('No historical data available to download');
      return;
    }

    // Create CSV content
    const csvContent = [
      // CSV header
      ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'].join(','),
      // CSV data rows
      ...historicalData.map(day => 
        [day.time, day.open, day.high, day.low, day.close, day.volume].join(',')
      )
    ].join('\n');

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${stockData?.symbol}_historical_data.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [historicalData, stockData]);

  /**
   * Downloads the latest stock price data as a CSV file
   */
  const downloadLatestPriceCSV = useCallback(() => {
    // Check if stock data is available
    if (!stockData) {
      console.error('No stock data available to download');
      return;
    }

    // Create CSV content
    const csvContent = [
      // CSV header
      ['Symbol', 'Price', 'Open', 'High', 'Low', 'Volume', 'Latest Trading Day', 'Previous Close', 'Change', 'Change Percent'].join(','),
      // CSV data row
      [
        stockData.symbol,
        stockData.price,
        stockData.open,
        stockData.high,
        stockData.low,
        stockData.volume,
        stockData.latestTradingDay,
        stockData.previousClose,
        stockData.change,
        stockData.changePercent
      ].join(',')
    ].join('\n');

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${stockData.symbol}_latest_price.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [stockData]);

  // Return the download functions
  return { downloadCSV, downloadLatestPriceCSV };
};