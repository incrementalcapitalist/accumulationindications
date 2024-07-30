// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData } from 'lightweight-charts';
// Import the StockData type from our types file
import { StockData } from '../types';

// Define the props interface for the StockQuote component
interface StockQuoteProps {
  stockData: StockData | null; // Current stock data or null if not fetched
  historicalData: { time: string; open: number; high: number; low: number; close: number }[]; // Array of historical price data
}

// Define the structure for Heikin-Ashi data, extending CandlestickData
interface HeikinAshiData extends CandlestickData {
  time: string;
}

// Define the StockQuote functional component
const StockQuote: React.FC<StockQuoteProps> = ({ stockData, historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Function to calculate Heikin-Ashi data from regular candlestick data
  const calculateHeikinAshi = (data: typeof historicalData): HeikinAshiData[] => {
    let haData: HeikinAshiData[] = [];
    
    data.forEach((candle, index) => {
      const haCandle: HeikinAshiData = {
        time: candle.time,
        open: index === 0 ? candle.open : (haData[index - 1].open + haData[index - 1].close) / 2,
        close: (candle.open + candle.high + candle.low + candle.close) / 4,
        high: candle.high,
        low: candle.low
      };
      
      // Adjust high and low values
      haCandle.high = Math.max(haCandle.open, haCandle.close, candle.high);
      haCandle.low = Math.min(haCandle.open, haCandle.close, candle.low);
      
      haData.push(haCandle);
    });
    
    return haData;
  };

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { visible: false }, // Hide vertical grid lines
            horzLines: { visible: false }, // Hide horizontal grid lines
          },
        });
      }

      // Calculate Heikin-Ashi data
      const haData = calculateHeikinAshi(historicalData);

      // Add the Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#9c27b0', // Purple for up days
        downColor: '#ff9800', // Orange for down days
        borderVisible: false,
        wickUpColor: '#9c27b0',
        wickDownColor: '#ff9800',
      });

      // Set the Heikin-Ashi data on the series
      candlestickSeries.setData(haData);

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

  // Render the component
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
        <div>
          <span className="font-semibold">Open:</span> ${formatNumber(stockData.open)}
        </div>
        <div>
          <span className="font-semibold">Previous Close:</span> ${formatNumber(stockData.previousClose)}
        </div>
        <div>
          <span className="font-semibold">Day's High:</span> ${formatNumber(stockData.high)}
        </div>
        <div>
          <span className="font-semibold">Day's Low:</span> ${formatNumber(stockData.low)}
        </div>
        <div>
          <span className="font-semibold">Volume:</span> {stockData.volume.toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Latest Trading Day:</span> {stockData.latestTradingDay}
        </div>
      </div>

      {/* Heikin-Ashi chart */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Heikin-Ashi Chart</h3>
        {/* Chart container div, referenced by chartContainerRef */}
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
};

// Export the StockQuote component
export default StockQuote;