import { StockData, HistoricalDataPoint } from '../types';
import { format, subYears } from 'date-fns';

export const fetchStockData = async (symbol: string): Promise<{ stockData: StockData; historicalData: HistoricalDataPoint[] }> => {
  try {
    // Fetch current stock data from Polygon.io
    const quoteResponse = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`);
    const quoteData = await quoteResponse.json();

    if (quoteData.status === 'ERROR') {
      throw new Error(quoteData.message || 'Failed to fetch data from Polygon.io');
    }

    const result = quoteData.results[0];
    
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

    if (historicalData.status === 'ERROR') {
      throw new Error(historicalData.message || 'Failed to fetch historical data from Polygon.io');
    }

    const formattedHistoricalData: HistoricalDataPoint[] = historicalData.results.map((item: any) => ({
      time: format(new Date(item.t), 'yyyy-MM-dd'),
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
    }));

    return { stockData, historicalData: formattedHistoricalData };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};