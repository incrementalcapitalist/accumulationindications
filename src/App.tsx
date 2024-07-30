import React, { useState, useCallback } from "react";
import StockQuote from "./components/StockQuote";
import AccumulationIndications from "./components/AccumulationIndications";
import { StockData } from "./types";

interface HistoricalData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quote' | 'accumulation'>('quote');
  const [symbol, setSymbol] = useState<string>('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch current stock data
      const quoteResponse = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_API_KEY}`);
      const quoteData = await quoteResponse.json();

      if (quoteData['Error Message']) {
        throw new Error(quoteData['Error Message']);
      }

      const globalQuote = quoteData['Global Quote'];
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

      if (historicalData['Error Message']) {
        throw new Error(historicalData['Error Message']);
      }

      const timeSeries = historicalData['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No historical data found for this symbol');
      }

      const formattedHistoricalData: HistoricalData[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        time: date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      })).reverse();

      setHistoricalData(formattedHistoricalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
            Stock Market Analysis Dashboard
          </h1>
          
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
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'accumulation' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('accumulation')}
            >
              Accumulation/Distribution
            </button>
          </div>
      
      {/* Content area */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {activeTab === 'quote' ? (
          <StockQuote 
            stockData={stockData} 
            historicalData={historicalData.map(d => ({ time: d.time, value: d.close }))}
          />
        ) : (
          <AccumulationIndications historicalData={historicalData} />
        )}
      </div>
    </div>
  );
};

export default App;