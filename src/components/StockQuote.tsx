/**
 * StockQuote.tsx
 * This component renders detailed stock quote information and a candlestick chart.
 */

// Import necessary dependencies
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickSeriesOptions } from 'lightweight-charts';
import { StockData } from '../types';
import { CalculatedIndicators } from '../utils/calculateIndicators';

/**
 * Props for the StockQuote component
 * @interface StockQuoteProps
 */
interface StockQuoteProps {
  // Current stock data
  stockData: StockData;
  // Historical price data
  historicalData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  // Pre-calculated indicators
  indicators: CalculatedIndicators;
}

/**
 * StockQuote Component
 * Displays detailed stock information and a candlestick chart
 * 
 * @param {StockQuoteProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const StockQuote: React.FC<StockQuoteProps> = ({ stockData, historicalData, indicators }) => {
  // Reference to the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Reference to the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  // Effect to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Create a new chart if it doesn't exist
      if (!chartRef.current) {
        // Initialize the chart with specific dimensions and styling
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
          },
        });
      }

      // Add the candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#9c27b0', // Purple for up days
        downColor: '#ff9800', // Orange for down days
        borderVisible: false,
        wickUpColor: '#9c27b0',
        wickDownColor: '#ff9800',
      });

      // Set the candlestick data
      candlestickSeries.setData(historicalData);

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

  /**
   * Formats a number to 2 decimal places
   * @param {number} num - The number to format
   * @returns {string} The formatted number
   */
  const formatNumber = (num: number): string => num.toFixed(2);

  /**
   * Determines the CSS class for price change (green for positive, red for negative)
   * @param {number} change - The price change
   * @returns {string} The CSS class name
   */
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

      {/* Candlestick chart */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Price Chart</h3>
        {/* Chart container div, referenced by chartContainerRef */}
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>

      {/* Comprehensive description of the stock quote information */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Stock Quote Information</h3>
        <p>A stock quote provides key information about a stock's current trading status and recent performance. Here's what each piece of information means:</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Current Price:</span> The most recent price at which the stock has traded.</li>
          <li><span className="font-semibold">Change/Change Percent:</span> The dollar and percentage change from the previous day's closing price.</li>
          <li><span className="font-semibold">Open:</span> The price at which the stock first traded upon the opening of the exchange on the current trading day.</li>
          <li><span className="font-semibold">Previous Close:</span> The stock's closing price on the previous trading day.</li>
          <li><span className="font-semibold">Day's High/Low:</span> The highest and lowest prices at which the stock has traded so far during the current trading session.</li>
          <li><span className="font-semibold">Volume:</span> The number of shares that have been traded during the current trading day.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Candlestick Chart:</h4>
        <p>The chart displays price movements over time using candlesticks. Each candlestick typically represents one day of trading and shows four key pieces of information:</p>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Open:</span> The top of the body for a down day, or the bottom of the body for an up day.</li>
          <li><span className="font-semibold">Close:</span> The bottom of the body for a down day, or the top of the body for an up day.</li>
          <li><span className="font-semibold">High:</span> The top of the upper wick (shadow).</li>
          <li><span className="font-semibold">Low:</span> The bottom of the lower wick (shadow).</li>
        </ul>
        <p>Green candlesticks indicate up days (close higher than open), while red candlesticks indicate down days (close lower than open).</p>

        <p className="mt-3"><span className="font-semibold">Note:</span> While this information provides a snapshot of a stock's current status and recent performance, it's important to consider longer-term trends, fundamental analysis, and broader market conditions when making investment decisions.</p>
      </div>
    </div>
  );
};

// Export the StockQuote component
export default StockQuote;