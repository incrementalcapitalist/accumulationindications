// Import necessary dependencies from React
import React, { useState, useCallback } from "react";
// Import child components
import StockQuote from "./components/StockQuote";
import AccumulationIndications from "./components/AccumulationIndications";
import OBVAndRSI from "./components/OBVAndRSI";
import PriceMACD from "./components/PriceMACD";
import FibonacciRetracement from "./components/FibonacciRetracement";
// Import types
import { StockData } from "./types";

// Define the structure for historical data
interface HistoricalData {
  time: string;    // Date/time of the data point
  open: number;    // Opening price
  high: number;    // Highest price
  low: number;     // Lowest price
  close: number;   // Closing price
  volume: number;  // Trading volume
}

// Define the main App component
const App: React.FC = () => {
  // Update the activeTab state (quote, accumulation, obv-rsi, or price-macd) to include the new 'fibonacci' option
  const [activeTab, setActiveTab] = useState<'quote' | 'accumulation' | 'obv-rsi' | 'price-macd' | 'fibonacci'>('quote');
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

  // Function to fetch stock data from API
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
      // Fetch current stock data
      const quoteResponse = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_API_KEY}`);
      const quoteData = await quoteResponse.json();

      // Check for API error response
      if (quoteData['Error Message']) {
        throw new Error(quoteData['Error Message']);
      }

      // Extract the global quote data
      const globalQuote = quoteData['Global Quote'];
      // Set the stock data state with parsed values
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

      // Fetch historical data
      const historicalResponse = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_API_KEY}`);
      const historicalData = await historicalResponse.json();

      // Check for API error response
      if (historicalData['Error Message']) {
        throw new Error(historicalData['Error Message']);
      }

      // Extract the time series data
      const timeSeries = historicalData['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No historical data found for this symbol');
      }

      // Format the historical data
      const formattedHistoricalData: HistoricalData[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        time: date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      })).reverse(); // Reverse to get chronological order

      // Set the historical data state
      setHistoricalData(formattedHistoricalData);
    } catch (err) {
      // Set error state if an error occurs
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      // Set loading state to false when the operation is complete
      setLoading(false);
    }
  }, [symbol]); // This function depends on the symbol state

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    fetchData(); // Call the fetchData function
  };

  // Render the component
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
            Stock Market Analysis Dashboard
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
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'quote' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('quote')}
            >
              Stock Quote
            </button>
            <button
              className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'accumulation' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('accumulation')}
            >
              Accumulation/Distribution
            </button>
            <button
              className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'obv-rsi' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('obv-rsi')}
            >
              OBV & RSI
            </button>
            <button
              className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'price-macd' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('price-macd')}
            >
              Price & MACD
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'fibonacci' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('fibonacci')}
            >
              Fibonacci Retracement
            </button>
          </div>
          
          {/* Content area */}
          <div className="bg-white shadow-md rounded-lg p-6">
            {activeTab === 'quote' ? (
              <StockQuote 
                stockData={stockData} 
                historicalData={historicalData}
              />
            ) : activeTab === 'accumulation' ? (
              <AccumulationIndications historicalData={historicalData} />
            ) : activeTab === 'obv-rsi' ? (
              <OBVAndRSI historicalData={historicalData} />
            ) : activeTab === 'price-macd' ? (
              <PriceMACD historicalData={historicalData} />
            ) : (
              <FibonacciRetracement historicalData={historicalData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the App component
export default App;