/**
 * App.tsx
 * Main component for the Stock Price and Trading Volume Analysis Dashboard.
 * Manages application state, handles data fetching, and renders child components.
 */

import React, { useState, useCallback } from 'react';
import { format, subYears } from 'date-fns';

// Import child components
import StockQuote from './components/StockQuote';
import AccumulationDistribution from './components/AccumulationDistribution';
import OBV from './components/OBV';
import RSI from './components/RSI';
import MACD from './components/MACD';
import ATR from './components/ATR';
import CMF from './components/ChaikinMoneyFlow';
import FibonacciRetracement from './components/FibonacciRetracement';
import HeikinAshiVolumeProfile from './components/HeikinAshiVolumeProfile';
import HeikinAshiPivotPoints from './components/HeikinAshiPivotPoints';
import { StockData } from './types';

/**
 * Interface for historical stock data
 * @interface
 */
interface HistoricalData {
  time: string;   // Date of the data point
  open: number;   // Opening price
  high: number;   // Highest price
  low: number;    // Lowest price
  close: number;  // Closing price
  volume: number; // Trading volume
}

/**
 * Type definition for possible tab values
 * @typedef {('quote'|'accumulation'|'obv'|'rsi'|'macd'|'atr'|'cmf'|'fibonacci'|'heikin-ashi'|'pivot-points')} TabType
 */
type TabType = 'quote' | 'accumulation' | 'obv' | 'rsi' | 'macd' | 'atr' | 'cmf' | 'fibonacci' | 'heikin-ashi' | 'pivot-points';

/**
 * App Component
 * @returns {JSX.Element} The rendered component
 */
const App: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>('quote');
  
  // State for the stock symbol entered by user
  const [symbol, setSymbol] = useState<string>('');
  
  // State for current stock data
  const [stockData, setStockData] = useState<StockData | null>(null);
  
  // State for historical stock data
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  
  // State for loading indicator
  const [loading, setLoading] = useState<boolean>(false);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches stock data from Polygon.io API, with fallback to Alpha Vantage
   * This function is memoized with useCallback to prevent unnecessary re-renders
   */
  const fetchData = useCallback(async () => {
    // Check if a symbol has been entered
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    // Set loading state to true and clear any previous errors
    setLoading(true);
    setError(null);

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
      
      // Null checks and default values
      const close = result?.c ?? 0;
      const open = result?.o ?? 0;
      const high = result?.h ?? 0;
      const low = result?.l ?? 0;
      const volume = result?.v ?? 0;
      const prevClose = result?.pc ?? 0;

      // Set the stock data state with parsed values and null checks
      setStockData({
        symbol: symbol,
        price: close,
        open: open,
        high: high,
        low: low,
        volume: volume,
        latestTradingDay: result?.t ? format(new Date(result.t), 'yyyy-MM-dd') : 'N/A',
        previousClose: prevClose,
        change: Number((close - prevClose).toFixed(2)),
        changePercent: ((close - prevClose) / prevClose * 100).toFixed(2) + '%'
      });

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

      // Format the historical data to match our HistoricalData interface
      const formattedHistoricalData: HistoricalData[] = historicalData.results.map((item: any) => ({
        time: format(new Date(item.t), 'yyyy-MM-dd'),
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v,
      }));

      // Set the historical data state
      setHistoricalData(formattedHistoricalData);

    } catch (err) {
      // Log the error from Polygon.io
      console.error("Error fetching data from Polygon.io:", err);
      
      // Fallback to Alpha Vantage if Polygon.io fails
      try {
        // Fetch current stock data from Alpha Vantage
        const quoteResponse = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_API_KEY}`);
        const quoteData = await quoteResponse.json();

        // Check for error message in the response
        if (quoteData['Error Message']) {
          throw new Error(quoteData['Error Message']);
        }

        // Extract the global quote data
        const globalQuote = quoteData['Global Quote'];
        
        // Set the stock data state with parsed values from Alpha Vantage
        setStockData({
          symbol: globalQuote['01. symbol'],
          price: parseFloat(globalQuote['05. price']),
          open: parseFloat(globalQuote['02. open']),
          high: parseFloat(globalQuote['03. high']),
          low: parseFloat(globalQuote['04. low']),
          volume: parseInt(globalQuote['06. volume']),
          latestTradingDay: globalQuote['07. latest trading day'],
          previousClose: parseFloat(globalQuote['08. previous close']),
          change: parseFloat(globalQuote['09. change']),
          changePercent: globalQuote['10. change percent']
        });

        // Fetch historical data from Alpha Vantage
        const historicalResponse = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_API_KEY}`);
        const historicalData = await historicalResponse.json();

        // Check for error message in the response
        if (historicalData['Error Message']) {
          throw new Error(historicalData['Error Message']);
        }

        // Extract the time series data
        const timeSeries = historicalData['Time Series (Daily)'];
        
        // Check if time series data exists
        if (!timeSeries) {
          throw new Error('No historical data found for this symbol');
        }

        // Calculate the date one year ago
        const oneYearAgo = subYears(new Date(), 1);

        // Format the historical data, filtering for the last year
        const formattedHistoricalData: HistoricalData[] = Object.entries(timeSeries)
          .filter(([date]) => new Date(date) >= oneYearAgo) // Keep only data from the last year
          .map(([date, values]: [string, any]) => ({
            time: date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume']),
          }))
          .reverse(); // Reverse to get chronological order

        // Set the historical data state
        setHistoricalData(formattedHistoricalData);
      } catch (alphaVantageErr) {
        // Set error state if both APIs fail
        setError('Failed to fetch data from both Polygon.io and Alpha Vantage. Please try again later.');
        console.error("Error fetching data from Alpha Vantage:", alphaVantageErr);
      }
    } finally {
      // Set loading state to false when the operation is complete
      setLoading(false);
    }
  }, [symbol]); // This effect depends on the symbol state

  /**
   * Handles form submission
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    fetchData(); // Call the fetchData function
  };

  // Define tab names and their display text
  const tabs: [TabType, string][] = [
    ['quote', 'Stock Quote'],
    ['accumulation', 'Accumulation/Distribution'],
    ['obv', 'OBV'],
    ['rsi', 'RSI'],
    ['macd', 'MACD'],
    ['atr', 'ATR'],
    ['cmf', 'CMF'],
    ['fibonacci', 'Fibonacci Retracement'],
    ['heikin-ashi', 'Heikin-Ashi & Volume Profile'],
    ['pivot-points', 'Heikin-Ashi & Pivot Points'],
  ];

  // Render the component
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
            Stock Price and Trading Volume Analysis Dashboard
          </h1>
          
          {/* Form for stock symbol input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex items-center">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Stock Symbol"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Fetch Data'}
              </button>
            </div>
          </form>

          {/* Error message display */}
          {error && (
            <p className="text-red-500 mb-4" role="alert">{error}</p>
          )}

          {/* Tab navigation */}
          <div className="flex flex-wrap justify-center mb-6">
            {tabs.map(([tab, displayText]) => (
              <button
                key={tab}
                className={`px-4 py-2 m-1 rounded-lg ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab(tab as TabType)}
              >
                {displayText}
              </button>
            ))}
          </div>
          
          {/* Content area */}
          <div className="bg-white shadow-md rounded-lg p-6">
            {/* Render the appropriate component based on the active tab */}
            {activeTab === 'quote' && <StockQuote stockData={stockData} historicalData={historicalData} />}
            {activeTab === 'accumulation' && <AccumulationDistribution historicalData={historicalData} />}
            {activeTab === 'obv' && <OBV historicalData={historicalData} />}
            {activeTab === 'rsi' && <RSI historicalData={historicalData} />}
            {activeTab === 'macd' && <MACD historicalData={historicalData} />}
            {activeTab === 'atr' && <ATR historicalData={historicalData} />}
            {activeTab === 'cmf' && <CMF historicalData={historicalData} />}
            {activeTab === 'fibonacci' && <FibonacciRetracement historicalData={historicalData} />}
            {activeTab === 'heikin-ashi' && <HeikinAshiVolumeProfile historicalData={historicalData} />}
            {activeTab === 'pivot-points' && <HeikinAshiPivotPoints historicalData={historicalData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the App component
export default App;