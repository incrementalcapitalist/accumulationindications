import { useCallback } from 'react';
import { StockData, HistoricalDataPoint } from '../types';

export const useCSVDownload = (stockData: StockData | null, historicalData: HistoricalDataPoint[]) => {
  const downloadCSV = useCallback(() => {
    if (historicalData.length === 0) {
      console.error('No historical data available to download');
      return;
    }

    const csvContent = [
      ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'].join(','),
      ...historicalData.map(day => 
        [day.time, day.open, day.high, day.low, day.close, day.volume].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

  const downloadLatestPriceCSV = useCallback(() => {
    if (!stockData) {
      console.error('No stock data available to download');
      return;
    }

    const csvContent = [
      ['Symbol', 'Price', 'Open', 'High', 'Low', 'Volume', 'Latest Trading Day', 'Previous Close', 'Change', 'Change Percent'].join(','),
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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

  return { downloadCSV, downloadLatestPriceCSV };
};