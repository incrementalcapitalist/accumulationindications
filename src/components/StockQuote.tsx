// Import necessary dependencies from React
import React from 'react';
import { StockData } from '../types';

interface StockQuoteProps {
  stockData: StockData | null;
}

// Define the StockQuote functional component
const StockQuote: React.FC<StockQuoteProps> = ({ stockData }) => {
  // If no stock data is available, render a message
  if (!stockData) {
    return (
      <div className="text-center text-gray-600">
        No stock data available. Please enter a symbol and fetch data.
      </div>
    );
  }

  // Helper function to format numbers to 2 decimal places
  const formatNumber = (num: number): string => num.toFixed(2);

  // Helper function to determine the CSS class for price change (green for positive, red for negative)
  const getPriceChangeClass = (change: number): string => 
    change >= 0 ? 'text-green-600' : 'text-red-600';

  // Render the component with stock data
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Stock symbol and current price */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {stockData.symbol} Quote
      </h2>
      <div className="text-3xl font-bold mb-2">
        ${formatNumber(stockData.price)}
        {/* Display price change and percentage */}
        <span className={`ml-2 text-xl ${getPriceChangeClass(stockData.change)}`}>
          {stockData.change >= 0 ? '+' : ''}{formatNumber(stockData.change)} 
          ({stockData.changePercent})
        </span>
      </div>

      {/* Grid layout for other stock information */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Opening price */}
        <div>
          <span className="font-semibold">Open:</span> ${formatNumber(stockData.open)}
        </div>
        {/* Previous close price */}
        <div>
          <span className="font-semibold">Previous Close:</span> ${formatNumber(stockData.previousClose)}
        </div>
        {/* Day's high price */}
        <div>
          <span className="font-semibold">Day's High:</span> ${formatNumber(stockData.high)}
        </div>
        {/* Day's low price */}
        <div>
          <span className="font-semibold">Day's Low:</span> ${formatNumber(stockData.low)}
        </div>
        {/* Trading volume */}
        <div>
          <span className="font-semibold">Volume:</span> {stockData.volume.toLocaleString()}
        </div>
        {/* Latest trading day */}
        <div>
          <span className="font-semibold">Latest Trading Day:</span> {stockData.latestTradingDay}
        </div>
      </div>
    </div>
  );
};

// Export the component as the default export
export default StockQuote;