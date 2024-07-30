// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
// Import the StockData interface from our types file
import { StockData } from '../types';

// Define the props interface for the StockQuote component
interface StockQuoteProps {
  stockData: StockData | null; // Current stock data or null if not fetched
  historicalData: { time: string; value: number }[]; // Array of historical price data
}

// Define the StockQuote functional component
const StockQuote: React.FC<StockQuoteProps> = ({ stockData, historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 300,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
        });
      }

      // Add a line series to the chart and set its data
      const lineSeries = chartRef.current.addLineSeries({ color: '#2962FF' });
      lineSeries.setData(historicalData);

      // Fit the chart content to the available space
      chartRef.current.timeScale().fitContent();
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]); // This effect runs when historicalData changes

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

  // Render the component with stock data and chart
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

      {/* Historical price chart */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Price History</h3>
        {/* Chart container div, referenced by chartContainerRef */}
        <div ref={chartContainerRef} className="w-full h-[300px]" />
      </div>
    </div>
  );
};

// Export the component as the default export
export default StockQuote;